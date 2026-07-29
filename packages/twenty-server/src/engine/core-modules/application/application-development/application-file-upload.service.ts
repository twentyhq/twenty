import { Injectable } from '@nestjs/common';

import bytes from 'bytes';
import { type FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationDevelopmentThrottlerService } from 'src/engine/core-modules/application/application-development/application-development-throttler.service';
import { ALLOWED_APPLICATION_FILE_FOLDERS } from 'src/engine/core-modules/application/application-development/constants/application-development.constants';
import { type ApplicationFileUploadTargetDTO } from 'src/engine/core-modules/application/application-development/dtos/application-file-upload-target.dto';
import { type ApplicationFileUploadRequestInput } from 'src/engine/core-modules/application/application-development/dtos/create-application-file-uploads.input';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { settings } from 'src/engine/constants/settings';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { type FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const APPLICATION_FILE_SETTINGS = {
  isTemporaryFile: false,
  toDelete: false,
} as const;

// Direct upload for application files: the CLI asks for one upload url per
// built file in a single batched mutation, PUTs the bytes straight to storage,
// then confirms the whole batch. Deploying a large app therefore costs a
// handful of rate-limited api calls instead of one per file.
@Injectable()
export class ApplicationFileUploadService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationDevelopmentThrottlerService: ApplicationDevelopmentThrottlerService,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUploadService: FileUploadService,
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
  }): Promise<ApplicationFileUploadTargetDTO[]> {
    await this.applicationDevelopmentThrottlerService.throttlePerApplication({
      applicationIdentifier: applicationUniversalIdentifier,
      workspaceId,
    });

    const maxFileSize = bytes(settings.storage.maxDirectUploadFileSize) ?? 0;

    for (const file of files) {
      this.validateFileFolderOrThrow(file.fileFolder);
      this.validateFilePathOrThrow(file);

      if (file.size > maxFileSize) {
        throw new ApplicationException(
          `File "${file.filePath}" is ${file.size} bytes, above the ${maxFileSize} bytes limit.`,
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }
    }

    const application = await this.findApplicationOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
    });

    return Promise.all(
      files.map(async ({ fileFolder, filePath, size }) => {
        // The path is deterministic for application files, so re-uploading an
        // existing file reuses its record: take the id back from the upsert
        // rather than assuming the generated one won.
        const pendingFile = await this.fileStorageService.createPendingFile({
          fileFolder,
          applicationUniversalIdentifier,
          applicationId: application.id,
          workspaceId,
          resourcePath: filePath,
          fileId: v4(),
          size,
          mimeType: 'application/octet-stream',
          settings: APPLICATION_FILE_SETTINGS,
        });

        const uploadTarget = await this.fileUploadService.buildUploadTarget({
          workspaceId,
          fileId: pendingFile.id,
          fileFolder,
          applicationUniversalIdentifier,
          resourcePath: filePath,
          contentType: 'application/octet-stream',
          size,
        });

        return { ...uploadTarget, fileFolder, filePath };
      }),
    );
  }

  async completeApplicationFileUploads({
    workspaceId,
    applicationUniversalIdentifier,
    fileIds,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    fileIds: string[];
  }): Promise<FileDTO[]> {
    await this.applicationDevelopmentThrottlerService.throttlePerApplication({
      applicationIdentifier: applicationUniversalIdentifier,
      workspaceId,
    });

    const application = await this.findApplicationOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const files = await this.fileRepository.find(workspaceId, {
      where: { id: In(fileIds), applicationId: application.id },
    });

    const missingFileIds = fileIds.filter(
      (fileId) => !files.some((file) => file.id === fileId),
    );

    if (missingFileIds.length > 0) {
      throw new ApplicationException(
        `No pending upload found for file(s): ${missingFileIds.join(', ')}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return Promise.all(
      files.map((file) =>
        this.finalizeUploadedFile({
          workspaceId,
          applicationUniversalIdentifier,
          file,
        }),
      ),
    );
  }

  private async finalizeUploadedFile({
    workspaceId,
    applicationUniversalIdentifier,
    file,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    file: FileEntity;
  }): Promise<FileDTO> {
    const [fileFolder] = file.path.split('/');
    const resourcePath = removeFileFolderFromFileEntityPath(file.path);

    this.validateFileFolderOrThrow(fileFolder as FileFolder);

    const storageLocation = {
      fileFolder: fileFolder as FileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath,
    };

    const metadata =
      await this.fileStorageService.getFileMetadata(storageLocation);

    if (!isDefined(metadata)) {
      throw new ApplicationException(
        `File "${file.path}" has not been uploaded to storage yet.`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const declaredSize = Number(file.size);

    if (metadata.size !== declaredSize) {
      throw new ApplicationException(
        `File "${file.path}" has ${metadata.size} bytes in storage but ${declaredSize} were declared.`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const mimeType = await this.fileUploadService.detectUploadedMimeTypeOrThrow(
      { ...storageLocation, filename: file.path },
    );

    // The PENDING mime type is pinned to octet-stream by a db constraint, so
    // the record has to leave PENDING before it can carry its real type.
    await this.fileRepository.update(
      workspaceId,
      { id: file.id },
      { status: FILE_STATUS.UPLOADED, mimeType },
    );

    const size = await this.sanitizeUploadedFileIfNeeded({
      storageLocation,
      fileId: file.id,
      mimeType,
      size: metadata.size,
    });

    return { id: file.id, path: file.path, size, createdAt: file.createdAt };
  }

  // Bytes that go straight to storage skip the sanitization the multipart
  // upload path applies. Only svg carries an active payload today, so it is
  // read back, purified and rewritten in place.
  private async sanitizeUploadedFileIfNeeded({
    storageLocation,
    fileId,
    mimeType,
    size,
  }: {
    storageLocation: {
      fileFolder: FileFolder;
      applicationUniversalIdentifier: string;
      workspaceId: string;
      resourcePath: string;
    };
    fileId: string;
    mimeType: string;
    size: number;
  }): Promise<number> {
    if (mimeType !== 'image/svg+xml') {
      return size;
    }

    const stream = await this.fileStorageService.readFile(storageLocation);
    const sanitizedFile = sanitizeFile({
      file: await streamToBuffer(stream),
      ext: 'svg',
      mimeType,
    });

    const rewrittenFile = await this.fileStorageService.writeFile({
      ...storageLocation,
      sourceFile: sanitizedFile,
      fileId,
      settings: APPLICATION_FILE_SETTINGS,
    });

    return Number(rewrittenFile.size);
  }

  private validateFileFolderOrThrow(fileFolder: FileFolder): void {
    if (!ALLOWED_APPLICATION_FILE_FOLDERS.includes(fileFolder)) {
      throw new ApplicationException(
        `Invalid fileFolder for application file upload. Allowed values: ${ALLOWED_APPLICATION_FILE_FOLDERS.join(', ')}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }
  }

  private validateFilePathOrThrow({
    fileFolder,
    filePath,
  }: {
    fileFolder: FileFolder;
    filePath: string;
  }): void {
    const pathValidationResult = validateFilePath({
      resourcePath: filePath,
      fileFolder,
    });

    if (!pathValidationResult.isValid) {
      throw new ApplicationException(
        pathValidationResult.error,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }
  }

  private async findApplicationOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }) {
    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        'Application not found in workspace.',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return application;
  }
}
