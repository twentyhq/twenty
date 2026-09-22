import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buffer as streamToBuffer } from 'node:stream/consumers';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import bytes from 'bytes';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Like, type QueryRunner, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { settings } from 'src/engine/constants/settings';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { fetchImageWithTypeFromUrl } from 'src/utils/image';

const DIRECT_UPLOAD_CONTENT_TYPE = 'application/octet-stream';

@Injectable()
export class FileCorePictureService {
  private readonly logger = new Logger(FileCorePictureService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly fileUploadTargetService: FileUploadTargetService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  private async findCustomApplicationUniversalIdentifier(
    workspaceId: string,
  ): Promise<string> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['workspaceCustomApplicationId'],
      withDeleted: true,
    });

    if (!isDefined(workspace)) {
      throw new ApplicationException(
        `Could not find workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return workspace.workspaceCustomApplicationId;
  }

  private async uploadCorePicture({
    file,
    filename,
    workspaceId,
    applicationUniversalIdentifier,
    queryRunner,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
    applicationUniversalIdentifier?: string;
    queryRunner?: QueryRunner;
  }): Promise<FileEntity> {
    const { ext } = await extractFileInfoOrThrow({ file, filename });

    const fileId = v4();
    const finalName = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const universalIdentifier =
      applicationUniversalIdentifier ??
      (await this.findCustomApplicationUniversalIdentifier(workspaceId));

    const savedFile = await this.fileStorageService.writeFile({
      sourceFile: file,
      resourcePath: finalName,
      fileFolder: FileFolder.CorePicture,
      applicationUniversalIdentifier: universalIdentifier,
      workspaceId,
      fileId,
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
      queryRunner,
    });

    return savedFile;
  }

  private assertValidCorePictureUploadSize(size: number): void {
    const maxFileSize = bytes(settings.storage.maxDirectUploadFileSize) ?? 0;

    if (!Number.isInteger(size) || size <= 0 || size > maxFileSize) {
      throw new FileUploadException(
        `Invalid file size ${size} (max ${maxFileSize} bytes)`,
        FileUploadExceptionCode.FILE_TOO_LARGE,
        {
          userFriendlyMessage: msg`The file is empty or exceeds the maximum allowed size.`,
        },
      );
    }
  }

  private async createCorePictureUpload({
    workspaceId,
    filename,
    size,
  }: {
    workspaceId: string;
    filename: string;
    size: number;
  }): Promise<FileUploadTargetDTO> {
    this.assertValidCorePictureUploadSize(size);

    const { ext } = buildFileInfo(filename);
    const fileId = v4();
    const resourcePath = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const applicationUniversalIdentifier =
      await this.findCustomApplicationUniversalIdentifier(workspaceId);

    await this.fileStorageService.createPendingFile({
      fileFolder: FileFolder.CorePicture,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath,
      fileId,
      size,
      mimeType: DIRECT_UPLOAD_CONTENT_TYPE,
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    return this.fileUploadTargetService.buildUploadTarget({
      workspaceId,
      fileId,
      fileFolder: FileFolder.CorePicture,
      applicationUniversalIdentifier,
      resourcePath,
      contentType: DIRECT_UPLOAD_CONTENT_TYPE,
      size,
    });
  }

  private async completeCorePictureUpload({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: {
        id: fileId,
        path: Like(`${FileFolder.CorePicture}/%`),
      },
    });

    if (!isDefined(file)) {
      throw new FileUploadException(
        `File not found: ${fileId}`,
        FileUploadExceptionCode.FILE_NOT_FOUND,
        { userFriendlyMessage: msg`File not found.` },
      );
    }

    // A completion retried after a lost response finds the promoted file and
    // only has the binding left to do.
    if (file.status === FILE_STATUS.UPLOADED) {
      return file;
    }

    const applicationUniversalIdentifier =
      await this.findCustomApplicationUniversalIdentifier(workspaceId);

    const completedFile =
      await this.fileUploadCompletionService.completeUploadedFile({
        workspaceId,
        file,
        storageLocation: {
          fileFolder: FileFolder.CorePicture,
          applicationUniversalIdentifier,
          workspaceId,
          resourcePath: removeFileFolderFromFileEntityPath(file.path),
        },
      });

    return { ...file, ...completedFile, status: FILE_STATUS.UPLOADED };
  }

  private async toFileWithSignedUrl({
    file,
    workspaceId,
  }: {
    file: FileEntity;
    workspaceId: string;
  }): Promise<FileWithSignedUrlDTO> {
    return {
      ...file,
      url: await this.fileUrlService.signFileByIdUrl({
        fileId: file.id,
        fileFolder: FileFolder.CorePicture,
        workspaceId,
      }),
    };
  }

  async createWorkspaceLogoUpload({
    workspaceId,
    filename,
    size,
  }: {
    workspaceId: string;
    filename: string;
    size: number;
  }): Promise<FileUploadTargetDTO> {
    return this.createCorePictureUpload({ workspaceId, filename, size });
  }

  async completeWorkspaceLogoUpload({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileWithSignedUrlDTO> {
    const file = await this.completeCorePictureUpload({ workspaceId, fileId });

    // The workspace attached to the request comes from the core entity cache,
    // so the logo it carries may predate a previous upload.
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { id: workspaceId },
      select: ['id', 'logoFileId'],
    });

    await this.workspaceRepository.update(workspaceId, {
      logoFileId: file.id,
    });
    await this.coreEntityCacheService.invalidate(
      'workspaceEntity',
      workspaceId,
    );

    if (isDefined(workspace.logoFileId) && workspace.logoFileId !== file.id) {
      await this.deleteCorePicture({
        fileId: workspace.logoFileId,
        workspaceId,
      });
    }

    return this.toFileWithSignedUrl({ file, workspaceId });
  }

  async createWorkspaceMemberProfilePictureUpload({
    workspaceId,
    filename,
    size,
  }: {
    workspaceId: string;
    filename: string;
    size: number;
  }): Promise<FileUploadTargetDTO> {
    return this.createCorePictureUpload({ workspaceId, filename, size });
  }

  async completeWorkspaceMemberProfilePictureUpload({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileWithSignedUrlDTO> {
    const file = await this.completeCorePictureUpload({ workspaceId, fileId });

    return this.toFileWithSignedUrl({ file, workspaceId });
  }

  async uploadWorkspacePicture({
    file,
    filename,
    workspace,
  }: {
    file: Buffer;
    filename: string;
    workspace: WorkspaceEntity;
  }): Promise<FileWithSignedUrlDTO> {
    const savedFile = await this.uploadCorePicture({
      file,
      filename,
      workspaceId: workspace.id,
    });

    await this.workspaceRepository.update(workspace.id, {
      logoFileId: savedFile.id,
    });

    if (isDefined(workspace.logoFileId)) {
      await this.deleteCorePicture({
        fileId: workspace.logoFileId,
        workspaceId: workspace.id,
      });
    }

    const url = await this.fileUrlService.signFileByIdUrl({
      fileId: savedFile.id,
      fileFolder: FileFolder.CorePicture,
      workspaceId: workspace.id,
    });

    return {
      ...savedFile,
      url,
    };
  }

  async getPendingWorkspaceForLogoUploadOrThrow({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
    });

    if (
      !isDefined(workspace) ||
      !isDefined(userWorkspace) ||
      workspace.activationStatus !== WorkspaceActivationStatus.PENDING_CREATION
    ) {
      throw new AuthException(
        'Cannot set a logo for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return workspace;
  }

  async uploadWorkspaceMemberProfilePicture({
    file,
    filename,
    workspaceId,
    applicationUniversalIdentifier,
    queryRunner,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
    applicationUniversalIdentifier?: string;
    queryRunner?: QueryRunner;
  }): Promise<FileWithSignedUrlDTO> {
    const savedFile = await this.uploadCorePicture({
      file,
      filename,
      workspaceId,
      applicationUniversalIdentifier,
      queryRunner,
    });

    const url = await this.fileUrlService.signFileByIdUrl({
      fileId: savedFile.id,
      workspaceId,
      fileFolder: FileFolder.CorePicture,
    });

    return {
      ...savedFile,
      url,
    };
  }

  async deleteCorePicture({
    fileId,
    workspaceId,
  }: {
    fileId: string;
    workspaceId: string;
  }): Promise<void> {
    const file = await this.fileRepository.findOneOrFail(workspaceId, {
      where: {
        id: fileId,
        path: Like(`${FileFolder.CorePicture}/%`),
      },
    });

    const customApplicationUniversalIdentifier =
      await this.findCustomApplicationUniversalIdentifier(workspaceId);

    await this.fileStorageService.deleteFile({
      workspaceId,
      applicationUniversalIdentifier: customApplicationUniversalIdentifier,
      fileFolder: FileFolder.CorePicture,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    });
  }

  private async fetchImageBufferFromUrl(
    imageUrl: string,
  ): Promise<{ buffer: Buffer; extension: string } | undefined> {
    try {
      const httpClient = this.secureHttpClientService.getHttpClient({
        retries: 2,
        shouldResetTimeout: true,
      });

      return await fetchImageWithTypeFromUrl(imageUrl, httpClient);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch image from URL: ${imageUrl} — ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
  }

  async uploadWorkspaceMemberProfilePictureFromUrl({
    imageUrl,
    workspaceId,
    applicationUniversalIdentifier,
    queryRunner,
  }: {
    imageUrl: string;
    workspaceId: string;
    applicationUniversalIdentifier?: string;
    queryRunner?: QueryRunner;
  }): Promise<FileWithSignedUrlDTO | undefined> {
    const imageData = await this.fetchImageBufferFromUrl(imageUrl);

    if (!isDefined(imageData)) {
      return undefined;
    }

    return this.uploadWorkspaceMemberProfilePicture({
      file: imageData.buffer,
      filename: `avatar.${imageData.extension}`,
      workspaceId,
      applicationUniversalIdentifier,
      queryRunner,
    });
  }

  async uploadWorkspaceLogoFromUrl({
    imageUrl,
    workspaceId,
    applicationUniversalIdentifier,
    queryRunner,
  }: {
    imageUrl: string;
    workspaceId: string;
    applicationUniversalIdentifier?: string;
    queryRunner?: QueryRunner;
  }): Promise<FileEntity | undefined> {
    const imageData = await this.fetchImageBufferFromUrl(imageUrl);

    if (!isDefined(imageData)) {
      return undefined;
    }

    return this.uploadCorePicture({
      file: imageData.buffer,
      filename: `logo.${imageData.extension}`,
      workspaceId,
      applicationUniversalIdentifier,
      queryRunner,
    });
  }

  async copyWorkspaceMemberProfilePicture({
    sourceWorkspaceId,
    sourceFileId,
    targetWorkspaceId,
    targetApplicationUniversalIdentifier,
    queryRunner,
  }: {
    sourceWorkspaceId: string;
    sourceFileId: string;
    targetWorkspaceId: string;
    targetApplicationUniversalIdentifier?: string;
    queryRunner?: QueryRunner;
  }): Promise<FileWithSignedUrlDTO> {
    const sourceFile = await this.fileRepository.findOneOrFail(
      sourceWorkspaceId,
      {
        where: {
          id: sourceFileId,
          path: Like(`${FileFolder.CorePicture}/%`),
        },
      },
    );

    const sourceApplicationUniversalIdentifier =
      await this.findCustomApplicationUniversalIdentifier(sourceWorkspaceId);

    const fileStream = await this.fileStorageService.readFile({
      workspaceId: sourceWorkspaceId,
      applicationUniversalIdentifier: sourceApplicationUniversalIdentifier,
      fileFolder: FileFolder.CorePicture,
      resourcePath: removeFileFolderFromFileEntityPath(sourceFile.path),
    });

    const filename = sourceFile.path.split('/').pop() ?? '';

    return this.uploadWorkspaceMemberProfilePicture({
      file: await streamToBuffer(fileStream),
      filename,
      workspaceId: targetWorkspaceId,
      applicationUniversalIdentifier: targetApplicationUniversalIdentifier,
      queryRunner,
    });
  }
}
