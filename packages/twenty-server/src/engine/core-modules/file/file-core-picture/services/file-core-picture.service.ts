import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buffer as streamToBuffer } from 'node:stream/consumers';

import { isNonEmptyString } from '@sniptt/guards';
import FileType from 'file-type';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Like, type QueryRunner, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileWithSignedUrlDto } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getImageBufferFromUrl } from 'src/utils/image';

@Injectable()
export class FileCorePictureService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

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
    const { mimeType, ext } = await extractFileInfo({ file, filename });
    const sanitizedFile = sanitizeFile({ file, ext, mimeType });

    const fileId = v4();
    const finalName = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const universalIdentifier =
      applicationUniversalIdentifier ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication.universalIdentifier;

    const savedFile = await this.fileStorageService.writeFile({
      sourceFile: sanitizedFile,
      resourcePath: `${FileFolder.CorePicture}/${finalName}`,
      mimeType,
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
  }): Promise<FileWithSignedUrlDto> {
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

    const url = this.fileUrlService.signFileByIdUrl({
      fileId: savedFile.id,
      fileFolder: FileFolder.CorePicture,
      workspaceId: workspace.id,
    });

    return {
      ...savedFile,
      url,
    };
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
  }): Promise<FileWithSignedUrlDto> {
    const savedFile = await this.uploadCorePicture({
      file,
      filename,
      workspaceId,
      applicationUniversalIdentifier,
      queryRunner,
    });

    const url = this.fileUrlService.signFileByIdUrl({
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
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        path: Like(`${FileFolder.CorePicture}/%`),
        workspaceId,
      },
    });

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    await this.fileStorageService.delete({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      fileFolder: FileFolder.CorePicture,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    });
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
  }): Promise<FileWithSignedUrlDto | undefined> {
    const httpClient = this.secureHttpClientService.getHttpClient();
    const buffer = await getImageBufferFromUrl(imageUrl, httpClient);

    const type = await FileType.fromBuffer(buffer);

    if (!isDefined(type) || !type.mime.startsWith('image/')) {
      return;
    }

    return this.uploadWorkspaceMemberProfilePicture({
      file: buffer,
      filename: `avatar.${type.ext}`,
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
  }): Promise<FileWithSignedUrlDto> {
    const sourceFile = await this.fileRepository.findOneOrFail({
      where: {
        id: sourceFileId,
        workspaceId: sourceWorkspaceId,
        path: Like(`${FileFolder.CorePicture}/%`),
      },
    });

    const { workspaceCustomFlatApplication: sourceApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId: sourceWorkspaceId,
        },
      );

    const fileStream = await this.fileStorageService.readFile({
      workspaceId: sourceWorkspaceId,
      applicationUniversalIdentifier: sourceApplication.universalIdentifier,
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
