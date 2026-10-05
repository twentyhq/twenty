import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import path from 'path';

import { msg } from '@lingui/core/macro';
import { parseApplicationVariableFilesValue } from 'twenty-shared/application';
import { FileFolder, ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, Like, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  type ApplicationVariableFilesValueUpdate,
  diffApplicationVariableFilesValue,
  serializeApplicationVariableFilesValueToStore,
  validateApplicationVariableFilesValueInput,
} from 'src/engine/core-modules/application/utils/application-variable-files-value.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { type FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  FileUploadCompletionService,
  type FileUploadStorageLocation,
} from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const FILE_FOLDER = ServerFileFolder.ApplicationRegistrationVariable;

@Injectable()
export class ApplicationRegistrationVariableFileService {
  private readonly logger = new Logger(
    ApplicationRegistrationVariableFileService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly serverFileStorageService: ServerFileStorageService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  // The upload lands in the uploader's workspace, where the completion sniffs
  // and sanitizes it. Only then is it copied to instance-level storage: the
  // file must outlive that workspace and follow the registration when its
  // ownership is transferred.
  async completeFileUpload({
    applicationRegistrationId,
    uploaderWorkspaceId,
    fileId,
  }: {
    applicationRegistrationId: string;
    uploaderWorkspaceId: string;
    fileId: string;
  }): Promise<FileWithSignedUrlDTO> {
    await this.assertRegistrationExistsOrThrow(applicationRegistrationId);

    const uploadedFile = await this.fileRepository.findOne(
      uploaderWorkspaceId,
      {
        where: {
          id: fileId,
          path: Like(`${FileFolder.ApplicationRegistrationVariableUpload}/%`),
        },
      },
    );

    if (!isDefined(uploadedFile)) {
      throw new ApplicationRegistrationException(
        `Variable file upload ${fileId} not found`,
        ApplicationRegistrationExceptionCode.VARIABLE_FILE_UPLOAD_NOT_FOUND,
      );
    }

    const application = await this.applicationRepository.findOneOrFail(
      uploaderWorkspaceId,
      { where: { id: uploadedFile.applicationId } },
    );

    const uploadLocation: FileUploadStorageLocation = {
      fileFolder: FileFolder.ApplicationRegistrationVariableUpload,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: uploaderWorkspaceId,
      resourcePath: removeFileFolderFromFileEntityPath(uploadedFile.path),
    };

    const mimeType =
      uploadedFile.status === FILE_STATUS.UPLOADED
        ? uploadedFile.mimeType
        : (
            await this.fileUploadCompletionService.completeUploadedFile({
              workspaceId: uploaderWorkspaceId,
              file: uploadedFile,
              storageLocation: uploadLocation,
            })
          ).mimeType;

    try {
      const serverFileId = v4();

      const serverFile =
        await this.serverFileStorageService.writeServerFileFromStream({
          fileFolder: FILE_FOLDER,
          applicationRegistrationId,
          resourcePath: `${serverFileId}${path.extname(uploadedFile.path)}`,
          stream: await this.fileStorageService.readFile(uploadLocation),
          size: uploadedFile.size,
          mimeType,
          fileId: serverFileId,
          settings: { isTemporaryFile: true, toDelete: false },
        });

      try {
        return {
          id: serverFile.id,
          path: serverFile.path,
          size: serverFile.size,
          createdAt: serverFile.createdAt,
          url: await this.fileUrlService.signServerFileByIdUrl({
            fileId: serverFile.id,
            applicationRegistrationId,
            fileFolder: FILE_FOLDER,
          }),
        };
      } catch (error) {
        // The client never learns this id, so the copy would stay unreachable
        await this.deleteServerFilesSilently({
          applicationRegistrationId,
          fileIds: [serverFile.id],
        });

        throw error;
      }
    } finally {
      // The workspace copy only existed to be inspected: a failed copy is retried with a new upload
      await this.deleteUploadSilently({ fileId, uploaderWorkspaceId });
    }
  }

  // Urls are minted on every read instead of being stored: signed ones expire,
  // and even permanent ones depend on the current signing key.
  async signFilesValue({
    plaintextValue,
    applicationRegistrationId,
    signUrl,
  }: {
    plaintextValue: string;
    applicationRegistrationId: string;
    signUrl: boolean;
  }): Promise<string> {
    const files = parseApplicationVariableFilesValue(plaintextValue);

    if (files.length === 0) {
      return '';
    }

    const signedFiles = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await this.fileUrlService.signServerFileByIdUrl({
          fileId: file.fileId,
          applicationRegistrationId,
          fileFolder: FILE_FOLDER,
          isPermanent: !signUrl,
        }),
      })),
    );

    return JSON.stringify(signedFiles);
  }

  async prepareFilesValueUpdate({
    applicationRegistrationId,
    previousPlaintextValue,
    nextPlaintextValue,
  }: {
    applicationRegistrationId: string;
    previousPlaintextValue: string;
    nextPlaintextValue: string;
  }): Promise<ApplicationVariableFilesValueUpdate> {
    const validation =
      validateApplicationVariableFilesValueInput(nextPlaintextValue);

    if (!validation.isValid) {
      throw this.buildInvalidFilesValueException(
        `Server variable ${validation.error}`,
      );
    }

    const { previousFileById, fileIdsToBind, fileIdsToDelete } =
      diffApplicationVariableFilesValue({
        previousPlaintextValue,
        nextFiles: validation.files,
      });

    const uploadedFileById = await this.findUploadedFilesToBindOrThrow({
      applicationRegistrationId,
      fileIds: fileIdsToBind,
    });

    return {
      plaintextValueToStore: serializeApplicationVariableFilesValueToStore({
        nextFiles: validation.files,
        previousFileById,
        uploadedFileById,
      }),
      fileIdsToBind,
      fileIdsToDelete,
    };
  }

  // Runs in the transaction that stores the value: the claim is conditional,
  // so two concurrent saves can never bind the same upload, and dropped rows
  // disappear with the value they belonged to. Returns the dropped rows.
  async applyFilesValueUpdate({
    entityManager,
    applicationRegistrationId,
    fileIdsToBind,
    fileIdsToDelete,
  }: Pick<
    ApplicationVariableFilesValueUpdate,
    'fileIdsToBind' | 'fileIdsToDelete'
  > & {
    entityManager: EntityManager;
    applicationRegistrationId: string;
  }): Promise<FileEntity[]> {
    const claimedCount =
      await this.serverFileStorageService.claimTemporaryServerFiles({
        fileFolder: FILE_FOLDER,
        applicationRegistrationId,
        fileIds: fileIdsToBind,
        entityManager,
      });

    if (claimedCount !== fileIdsToBind.length) {
      throw this.buildInvalidFilesValueException(
        `Some of the files ${fileIdsToBind.join(', ')} are already bound to a variable`,
        msg`A file is already used by another variable. Please upload it again.`,
      );
    }

    return this.serverFileStorageService.deleteServerFileRowsByIds({
      fileFolder: FILE_FOLDER,
      applicationRegistrationId,
      fileIds: fileIdsToDelete,
      entityManager,
    });
  }

  // The rows are already gone, so a failure here only leaks bytes
  async deleteFileBytes(files: FileEntity[]): Promise<void> {
    await this.serverFileStorageService.deleteServerFileBytes(files);
  }

  // For a variable that stops being a FILES variable or disappears
  async deleteFilesOfValue({
    applicationRegistrationId,
    plaintextValue,
    entityManager,
  }: {
    applicationRegistrationId: string;
    plaintextValue: string;
    entityManager?: EntityManager;
  }): Promise<void> {
    const droppedFiles =
      await this.serverFileStorageService.deleteServerFileRowsByIds({
        fileFolder: FILE_FOLDER,
        applicationRegistrationId,
        fileIds: parseApplicationVariableFilesValue(plaintextValue).map(
          ({ fileId }) => fileId,
        ),
        entityManager,
      });

    await this.deleteFileBytes(droppedFiles);
  }

  private async assertRegistrationExistsOrThrow(
    applicationRegistrationId: string,
  ): Promise<void> {
    const registrationExists =
      await this.applicationRegistrationRepository.existsBy({
        id: applicationRegistrationId,
      });

    if (!registrationExists) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${applicationRegistrationId} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }
  }

  private async deleteUploadSilently({
    fileId,
    uploaderWorkspaceId,
  }: {
    fileId: string;
    uploaderWorkspaceId: string;
  }): Promise<void> {
    try {
      await this.fileStorageService.deleteByFileId({
        fileId,
        workspaceId: uploaderWorkspaceId,
        fileFolder: FileFolder.ApplicationRegistrationVariableUpload,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete variable file upload ${fileId} of workspace ${uploaderWorkspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async deleteServerFilesSilently({
    applicationRegistrationId,
    fileIds,
  }: {
    applicationRegistrationId: string;
    fileIds: string[];
  }): Promise<void> {
    try {
      await this.deleteFileBytes(
        await this.serverFileStorageService.deleteServerFileRowsByIds({
          fileFolder: FILE_FOLDER,
          applicationRegistrationId,
          fileIds,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to delete server variable files ${fileIds.join(', ')} of registration ${applicationRegistrationId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async findUploadedFilesToBindOrThrow({
    applicationRegistrationId,
    fileIds,
  }: {
    applicationRegistrationId: string;
    fileIds: string[];
  }): Promise<Map<string, FileEntity>> {
    const files = await this.serverFileStorageService.findServerFilesByIds({
      fileFolder: FILE_FOLDER,
      applicationRegistrationId,
      fileIds,
    });
    const fileById = new Map(files.map((file) => [file.id, file]));

    for (const fileId of fileIds) {
      const file = fileById.get(fileId);

      if (!isDefined(file)) {
        throw this.buildInvalidFilesValueException(
          `File ${fileId} was not uploaded for a server variable of this application`,
          msg`File ${fileId} was not uploaded for this application. Please upload it again.`,
        );
      }

      if (!file.settings?.isTemporaryFile) {
        throw this.buildInvalidFilesValueException(
          `File ${fileId} is already bound to a variable`,
          msg`File ${fileId} is already used by another variable. Please upload it again.`,
        );
      }
    }

    return fileById;
  }

  private buildInvalidFilesValueException(
    message: string,
    userFriendlyMessage = msg`Invalid files value for this server variable.`,
  ): ApplicationRegistrationException {
    return new ApplicationRegistrationException(
      message,
      ApplicationRegistrationExceptionCode.INVALID_INPUT,
      { userFriendlyMessage },
    );
  }
}
