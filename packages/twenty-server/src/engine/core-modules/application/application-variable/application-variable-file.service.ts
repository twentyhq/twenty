import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { parseApplicationVariableFilesValue } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, In, Raw } from 'typeorm';

import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import {
  type ApplicationVariableFilesValueUpdate,
  diffApplicationVariableFilesValue,
  serializeApplicationVariableFilesValueToStore,
  validateApplicationVariableFilesValueInput,
} from 'src/engine/core-modules/application/utils/application-variable-files-value.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ApplicationVariableFileService {
  private readonly logger = new Logger(ApplicationVariableFileService.name);

  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  // Urls are minted on every read instead of being stored: signed ones expire,
  // and even permanent ones depend on the current signing key.
  async signFilesValue({
    plaintextValue,
    workspaceId,
    signUrl,
  }: {
    plaintextValue: string;
    workspaceId: string;
    signUrl: boolean;
  }): Promise<string> {
    const files = parseApplicationVariableFilesValue(plaintextValue);

    if (files.length === 0) {
      return '';
    }

    const signedFiles = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await this.fileUrlService.signFileByIdUrl({
          fileId: file.fileId,
          workspaceId,
          fileFolder: FileFolder.ApplicationVariable,
          isPermanent: !signUrl,
        }),
      })),
    );

    return JSON.stringify(signedFiles);
  }

  async prepareFilesValueUpdate({
    applicationId,
    workspaceId,
    previousPlaintextValue,
    nextPlaintextValue,
  }: {
    applicationId: string;
    workspaceId: string;
    previousPlaintextValue: string;
    nextPlaintextValue: string;
  }): Promise<ApplicationVariableFilesValueUpdate> {
    const validation =
      validateApplicationVariableFilesValueInput(nextPlaintextValue);

    if (!validation.isValid) {
      throw this.buildInvalidFilesValueException(
        `Application variable ${validation.error}`,
      );
    }

    const { previousFileById, fileIdsToBind, fileIdsToDelete } =
      diffApplicationVariableFilesValue({
        previousPlaintextValue,
        nextFiles: validation.files,
      });

    const uploadedFileById = await this.findUploadedFilesToBindOrThrow({
      fileIds: fileIdsToBind,
      applicationId,
      workspaceId,
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
    manager,
    fileIdsToBind,
    fileIdsToDelete,
    workspaceId,
  }: Pick<
    ApplicationVariableFilesValueUpdate,
    'fileIdsToBind' | 'fileIdsToDelete'
  > & {
    manager: EntityManager;
    workspaceId: string;
  }): Promise<FileEntity[]> {
    if (fileIdsToBind.length > 0) {
      const { affected } = await this.fileRepository
        .withManager(manager)
        .update(
          workspaceId,
          {
            id: In(fileIdsToBind),
            settings: Raw((alias) => `${alias} ->> 'isTemporaryFile' = 'true'`),
          },
          { settings: { isTemporaryFile: false, toDelete: false } },
        );

      if (affected !== fileIdsToBind.length) {
        throw this.buildInvalidFilesValueException(
          `Some of the files ${fileIdsToBind.join(', ')} are already bound to a variable`,
          msg`A file is already used by another variable. Please upload it again.`,
        );
      }
    }

    return this.fileStorageService.deleteFileRowsByIds({
      workspaceId,
      fileIds: fileIdsToDelete,
      fileFolder: FileFolder.ApplicationVariable,
      manager,
    });
  }

  // The rows are already gone, so a failure here only leaks bytes
  async deleteFileBytes({
    workspaceId,
    files,
  }: {
    workspaceId: string;
    files: FileEntity[];
  }): Promise<void> {
    for (const file of files) {
      try {
        await this.fileStorageService.deleteFileObjectOfDeletedRow({
          workspaceId,
          file,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to delete the bytes of file ${file.id} dropped from an application variable in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async findUploadedFilesToBindOrThrow({
    fileIds,
    applicationId,
    workspaceId,
  }: {
    fileIds: string[];
    applicationId: string;
    workspaceId: string;
  }): Promise<Map<string, FileEntity>> {
    if (fileIds.length === 0) {
      return new Map();
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: { id: In(fileIds) },
    });
    const fileById = new Map(files.map((file) => [file.id, file]));

    for (const fileId of fileIds) {
      const file = fileById.get(fileId);

      if (
        !isDefined(file) ||
        file.applicationId !== applicationId ||
        !file.path.startsWith(`${FileFolder.ApplicationVariable}/`)
      ) {
        throw this.buildInvalidFilesValueException(
          `File ${fileId} was not uploaded for an application variable of this application`,
          msg`File ${fileId} was not uploaded for this application. Please upload it again.`,
        );
      }

      // Direct uploads stay PENDING until the client confirms the bytes landed in storage.
      if (file.status !== FILE_STATUS.UPLOADED) {
        throw this.buildInvalidFilesValueException(
          `File ${fileId} upload has not been completed`,
          msg`File ${fileId} upload has not been completed. Please retry the upload.`,
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
    userFriendlyMessage = msg`Invalid files value for this application variable.`,
  ): ApplicationVariableEntityException {
    return new ApplicationVariableEntityException(
      message,
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      { userFriendlyMessage },
    );
  }
}
