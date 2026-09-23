import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buffer as streamToBuffer } from 'node:stream/consumers';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
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
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { fetchImageWithTypeFromUrl } from 'src/utils/image';

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
    private readonly fileUploadService: FileUploadService,
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
    isTemporaryFile = false,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
    applicationUniversalIdentifier?: string;
    queryRunner?: QueryRunner;
    isTemporaryFile?: boolean;
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
        isTemporaryFile,
        toDelete: false,
      },
      queryRunner,
    });

    return savedFile;
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

  private async findCorePictureFileOrThrow({
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

    return file;
  }

  private async findCurrentLogoFileId(
    workspaceId: string,
  ): Promise<string | null> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { id: workspaceId },
      select: ['id', 'logoFileId'],
    });

    return workspace.logoFileId;
  }

  private async claimFileAsWorkspaceLogo({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<string | null> {
    return this.workspaceRepository.manager.transaction(async (manager) => {
      const workspace = await manager.findOneOrFail(WorkspaceEntity, {
        where: { id: workspaceId },
        select: ['id', 'logoFileId'],
        lock: { mode: 'pessimistic_write' },
      });

      if (workspace.logoFileId === fileId) {
        return null;
      }

      const transactionalFileRepository =
        this.fileRepository.withManager(manager);

      const file = await transactionalFileRepository.findOne(workspaceId, {
        where: { id: fileId },
      });

      if (!isDefined(file)) {
        throw new FileUploadException(
          `File not found: ${fileId}`,
          FileUploadExceptionCode.FILE_NOT_FOUND,
          { userFriendlyMessage: msg`File not found.` },
        );
      }

      if (file.settings?.isTemporaryFile !== true) {
        throw new FileUploadException(
          `File ${fileId} was already finalized and cannot become the workspace logo`,
          FileUploadExceptionCode.BAD_REQUEST,
          {
            userFriendlyMessage: msg`This file upload has already been finalized.`,
          },
        );
      }

      await transactionalFileRepository.update(
        workspaceId,
        { id: fileId },
        { settings: { isTemporaryFile: false, toDelete: false } },
      );
      await manager.update(WorkspaceEntity, workspaceId, {
        logoFileId: fileId,
      });

      return workspace.logoFileId;
    });
  }

  private async bindWorkspaceLogo({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<void> {
    const replacedLogoFileId = await this.claimFileAsWorkspaceLogo({
      workspaceId,
      fileId,
    });

    await this.coreEntityCacheService.invalidate(
      'workspaceEntity',
      workspaceId,
    );

    if (isDefined(replacedLogoFileId)) {
      await this.deleteCorePicture({ fileId: replacedLogoFileId, workspaceId });
    }
  }

  async completeWorkspaceLogoUpload({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileWithSignedUrlDTO> {
    const file = await this.findCorePictureFileOrThrow({ workspaceId, fileId });
    const currentLogoFileId = await this.findCurrentLogoFileId(workspaceId);

    if (currentLogoFileId === file.id) {
      return this.toFileWithSignedUrl({ file, workspaceId });
    }

    const completedFile = await this.fileUploadService.completeFileUpload({
      workspaceId,
      fileId,
    });

    await this.bindWorkspaceLogo({ workspaceId, fileId });

    return completedFile;
  }

  async completeWorkspaceMemberProfilePictureUpload({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileWithSignedUrlDTO> {
    await this.findCorePictureFileOrThrow({ workspaceId, fileId });

    const completedFile = await this.fileUploadService.completeFileUpload({
      workspaceId,
      fileId,
    });

    await this.fileRepository.update(
      workspaceId,
      { id: fileId },
      { settings: { isTemporaryFile: false, toDelete: false } },
    );

    return completedFile;
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
      isTemporaryFile: true,
    });

    await this.bindWorkspaceLogo({
      workspaceId: workspace.id,
      fileId: savedFile.id,
    });

    return this.toFileWithSignedUrl({
      file: savedFile,
      workspaceId: workspace.id,
    });
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
