import { Injectable } from '@nestjs/common';

import bytes from 'bytes';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ALLOWED_APPLICATION_FILE_FOLDERS } from 'src/engine/core-modules/application/application-development/constants/application-development.constants';
import { CompleteApplicationFileUploadsResultDTO } from 'src/engine/core-modules/application/application-development/dtos/complete-application-file-uploads-result.dto';
import { CreateApplicationFileUploadsResultDTO } from 'src/engine/core-modules/application/application-development/dtos/create-application-file-uploads-result.dto';
import { doesFileStreamMatchHash } from 'src/engine/core-modules/application/application-development/utils/does-file-stream-match-hash.util';
import { type ApplicationFileUploadRequestInput } from 'src/engine/core-modules/application/application-development/dtos/create-application-file-uploads.input';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { settings } from 'src/engine/constants/settings';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  type BatchUploadTargetRequest,
  FileUploadTargetService,
} from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const APPLICATION_FILE_SETTINGS = {
  isTemporaryFile: false,
  toDelete: false,
} as const;

@Injectable()
export class ApplicationFileUploadService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationLookupService: ApplicationLookupService,
    private readonly fileUploadTargetService: FileUploadTargetService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async createApplicationFileUploads({
    workspaceId,
    applicationUniversalIdentifier,
    files,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    files: ApplicationFileUploadRequestInput[];
  }): Promise<CreateApplicationFileUploadsResultDTO> {
    const application = await this.findApplicationOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const maxFileSize = bytes(settings.storage.maxDirectUploadFileSize) ?? 0;

    const result: CreateApplicationFileUploadsResultDTO = {
      targets: [],
      unchangedFiles: [],
      errors: [],
    };

    const validFiles: ApplicationFileUploadRequestInput[] = [];

    for (const file of files) {
      const validationError = this.getFileValidationError(file, maxFileSize);

      if (isDefined(validationError)) {
        result.errors.push({
          fileFolder: file.fileFolder,
          filePath: file.filePath,
          message: validationError,
        });
        continue;
      }

      validFiles.push(file);
    }

    const reusableFiles = validFiles.filter((file) => isDefined(file.sha256));
    const uploadedFiles =
      reusableFiles.length > 0
        ? await this.fileRepository.find(workspaceId, {
            where: {
              applicationId: application.id,
              status: FILE_STATUS.UPLOADED,
              path: In(
                reusableFiles.map(
                  (file) => `${file.fileFolder}/${file.filePath}`,
                ),
              ),
            },
          })
        : [];
    const uploadedPaths = new Set(uploadedFiles.map((file) => file.path));
    const filesToUpload: ApplicationFileUploadRequestInput[] = [];

    for (const file of validFiles) {
      if (
        uploadedPaths.has(`${file.fileFolder}/${file.filePath}`) &&
        (await this.isFileUnchanged({
          workspaceId,
          applicationUniversalIdentifier,
          file,
        }))
      ) {
        result.unchangedFiles.push({
          fileFolder: file.fileFolder,
          filePath: file.filePath,
        });
      } else {
        filesToUpload.push(file);
      }
    }

    const requests: BatchUploadTargetRequest[] = filesToUpload.map((file) => ({
      workspaceId,
      applicationUniversalIdentifier,
      applicationId: application.id,
      fileFolder: file.fileFolder,
      resourcePath: file.filePath,
      size: file.size,
      settings: APPLICATION_FILE_SETTINGS,
    }));

    const batchResults =
      await this.fileUploadTargetService.createUploadTargetsBatch(requests);

    batchResults.forEach((batchResult, index) => {
      const file = filesToUpload[index];

      if (batchResult.success) {
        result.targets.push({
          ...batchResult.value,
          fileFolder: file.fileFolder,
          filePath: file.filePath,
        });
      } else {
        result.errors.push({
          fileFolder: file.fileFolder,
          filePath: file.filePath,
          message: batchResult.error,
        });
      }
    });

    return result;
  }

  async completeApplicationFileUploads({
    workspaceId,
    applicationUniversalIdentifier,
    fileIds,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    fileIds: string[];
  }): Promise<CompleteApplicationFileUploadsResultDTO> {
    const application = await this.findApplicationOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const files = await this.fileRepository.find(workspaceId, {
      where: { id: In(fileIds), applicationId: application.id },
    });

    const result: CompleteApplicationFileUploadsResultDTO = {
      files: [],
      errors: [],
    };

    const foundFileIds = new Set(files.map((file) => file.id));

    for (const fileId of fileIds) {
      if (!foundFileIds.has(fileId)) {
        result.errors.push({
          fileId,
          message: 'No pending upload found for this file.',
        });
      }
    }

    const batchResults =
      await this.fileUploadCompletionService.completeUploadsBatch(
        files.map((file) => ({
          workspaceId,
          applicationUniversalIdentifier,
          file,
        })),
      );

    batchResults.forEach((batchResult, index) => {
      const file = files[index];

      if (batchResult.success) {
        result.files.push(batchResult.value);
      } else {
        result.errors.push({ fileId: file.id, message: batchResult.error });
      }
    });

    return result;
  }

  private async isFileUnchanged({
    workspaceId,
    applicationUniversalIdentifier,
    file,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    file: ApplicationFileUploadRequestInput;
  }): Promise<boolean> {
    if (!isDefined(file.sha256)) {
      return false;
    }

    const location = {
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: file.fileFolder,
      resourcePath: file.filePath,
    };

    try {
      const metadata = await this.fileStorageService.getFileMetadata(location);

      if (metadata?.size !== file.size || !isDefined(metadata.checksum)) {
        return false;
      }

      const stream = await this.fileStorageService.readFile(location);
      if (
        !(await doesFileStreamMatchHash({
          stream,
          size: file.size,
          sha256: file.sha256,
        }))
      ) {
        return false;
      }

      const currentMetadata =
        await this.fileStorageService.getFileMetadata(location);

      return (
        currentMetadata?.size === file.size &&
        currentMetadata.checksum === metadata.checksum
      );
    } catch {
      return false;
    }
  }

  private getFileValidationError(
    file: ApplicationFileUploadRequestInput,
    maxFileSize: number,
  ): string | undefined {
    if (!ALLOWED_APPLICATION_FILE_FOLDERS.includes(file.fileFolder)) {
      return `Invalid fileFolder for application file upload. Allowed values: ${ALLOWED_APPLICATION_FILE_FOLDERS.join(', ')}`;
    }

    const pathValidationResult = validateFilePath({
      resourcePath: file.filePath,
      fileFolder: file.fileFolder,
    });

    if (!pathValidationResult.isValid) {
      return pathValidationResult.error;
    }

    if (file.size > maxFileSize) {
      return `File "${file.filePath}" is ${file.size} bytes, above the ${maxFileSize} bytes limit.`;
    }

    return undefined;
  }

  private async findApplicationOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }) {
    const application =
      await this.applicationLookupService.findByUniversalIdentifier({
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      });

    if (!isDefined(application)) {
      throw new ApplicationException(
        'Application not found in workspace.',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return application;
  }
}
