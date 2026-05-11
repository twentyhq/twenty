import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';
import { Like, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileResponse } from 'src/engine/core-modules/file/types/file-response.type';
import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class FileService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly fileStorageService: FileStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async getFileStreamByPath({
    workspaceId,
    applicationId,
    filepath,
    fileFolder,
  }: {
    workspaceId: string;
    applicationId: string;
    filepath: string;
    fileFolder: FileFolder;
  }): Promise<{ stream: Readable; mimeType: string }> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        path: `${fileFolder}/${filepath}`,
        workspaceId,
        applicationId,
      },
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: applicationId,
        workspaceId,
      },
    });

    const stream = await this.fileStorageService.readFile({
      resourcePath: filepath,
      fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
    });

    return {
      stream,
      mimeType: file.mimeType,
    };
  }

  async getFileStreamById({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<{ stream: Readable; mimeType: string }> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        workspaceId,
        path: Like(`${fileFolder}/%`),
      },
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: file.applicationId,
        workspaceId,
      },
    });

    const stream = await this.fileStorageService.readFile({
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
      fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
    });

    return {
      stream,
      mimeType: file.mimeType,
    };
  }

  async getFileResponseById(params: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<FileResponse> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: params.fileId,
        workspaceId: params.workspaceId,
        path: Like(`${params.fileFolder}/%`),
      },
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: file.applicationId,
        workspaceId: params.workspaceId,
      },
    });

    const mimeType = file.mimeType ?? 'application/octet-stream';
    const resourceIdentifier = {
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
      fileFolder: params.fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: params.workspaceId,
    };

    const presignedUrl = await this.fileStorageService.getPresignedUrl({
      ...resourceIdentifier,
      expiresInSeconds: this.twentyConfigService.get(
        'STORAGE_S3_PRESIGNED_URL_EXPIRES_IN',
      ),
      responseContentType: mimeType,
      responseContentDisposition: getContentDisposition(mimeType),
    });

    if (presignedUrl) {
      return { type: 'redirect', presignedUrl };
    }

    const stream = await this.fileStorageService.readFile(resourceIdentifier);

    return { type: 'stream', stream, mimeType };
  }

  async getFileContentById({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<{ buffer: Buffer; mimeType: string }> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        workspaceId,
        path: Like(`${fileFolder}/%`),
      },
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: file.applicationId,
        workspaceId,
      },
    });

    const stream = await this.fileStorageService.readFile({
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
      fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
    });

    const buffer = await streamToBuffer(stream);

    return {
      buffer,
      mimeType: file.mimeType ?? 'application/octet-stream',
    };
  }

  async deleteWorkspaceFolder(workspaceId: string) {
    const isWorkspaceFolderFound =
      await this.fileStorageService.checkIfWorkspaceFolderExists(workspaceId);

    if (!isWorkspaceFolderFound) {
      return;
    }

    return await this.fileStorageService.deleteWorkspaceFolder(workspaceId);
  }
}
