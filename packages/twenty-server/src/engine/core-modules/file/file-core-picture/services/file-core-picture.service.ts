import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buffer as streamToBuffer } from 'node:stream/consumers';

import { isNonEmptyString } from '@sniptt/guards';
import { FileTypeParser } from 'file-type';
import { detectPdf } from '@file-type/pdf';
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
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { getImageBufferFromUrl } from 'src/utils/image';

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

  // Authorization for setting a logo on a not-yet-activated workspace. Kept
  // separate from the upload so callers can reject before buffering the file.
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

      const buffer = await getImageBufferFromUrl(imageUrl, httpClient);

      const parser = new FileTypeParser({ customDetectors: [detectPdf] });
      const type = await parser.fromBuffer(buffer);

      if (!isDefined(type) || !type.mime.startsWith('image/')) {
        return undefined;
      }

      return { buffer, extension: type.ext };
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
