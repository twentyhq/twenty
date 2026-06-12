import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';
import { Like, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileResponse } from 'src/engine/core-modules/file/types/file-response.type';
import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly fileStorageService: FileStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async getFilePresignedUrlOrStreamByPath({
    workspaceId,
    applicationId,
    filepath,
    fileFolder,
  }: {
    workspaceId: string;
    applicationId: string;
    filepath: string;
    fileFolder: FileFolder;
  }): Promise<FileResponse | null> {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
        workspaceId,
      },
    });

    if (application === null) {
      return null;
    }

    const file = await this.fileRepository.findOne(workspaceId, {
      where: {
        path: `${fileFolder}/${filepath}`,
        applicationId,
      },
    });

    if (file === null) {
      return null;
    }

    return this.getFilePresignedUrlOrStream({
      resourcePath: filepath,
      fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
      mimeType: file.mimeType,
    });
  }

  async getFileStreamById({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<{ stream: Readable; mimeType: string } | null> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: {
        id: fileId,
        path: Like(`${fileFolder}/%`),
      },
    });

    if (file === null) {
      return null;
    }

    const application = await this.applicationRepository.findOne({
      where: {
        id: file.applicationId,
        workspaceId,
      },
    });

    if (application === null) {
      this.logger.warn(
        `File ${file.id} references missing application ${file.applicationId} in workspace ${workspaceId}`,
      );

      return null;
    }

    try {
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
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  async getFilePresignedUrlOrStreamById(params: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<FileResponse | null> {
    const file = await this.fileRepository.findOne(params.workspaceId, {
      where: {
        id: params.fileId,
        path: Like(`${params.fileFolder}/%`),
      },
    });

    if (file === null) {
      return null;
    }

    const application = await this.applicationRepository.findOne({
      where: {
        id: file.applicationId,
        workspaceId: params.workspaceId,
      },
    });

    if (application === null) {
      this.logger.warn(
        `File ${file.id} references missing application ${file.applicationId} in workspace ${params.workspaceId}`,
      );

      return null;
    }

    return this.getFilePresignedUrlOrStream({
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
      fileFolder: params.fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: params.workspaceId,
      mimeType: file.mimeType,
    });
  }

  private async getFilePresignedUrlOrStream({
    resourcePath,
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    mimeType,
  }: {
    resourcePath: string;
    fileFolder: FileFolder;
    applicationUniversalIdentifier: string;
    workspaceId: string;
    mimeType: string;
  }): Promise<FileResponse | null> {
    const resourceIdentifier = {
      resourcePath,
      fileFolder,
      applicationUniversalIdentifier,
      workspaceId,
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

    try {
      const stream = await this.fileStorageService.readFile(resourceIdentifier);

      return { type: 'stream', stream, mimeType };
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  async getFileContentById({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: {
        id: fileId,
        path: Like(`${fileFolder}/%`),
      },
    });

    if (file === null) {
      return null;
    }

    const application = await this.applicationRepository.findOne({
      where: {
        id: file.applicationId,
        workspaceId,
      },
    });

    if (application === null) {
      this.logger.warn(
        `File ${file.id} references missing application ${file.applicationId} in workspace ${workspaceId}`,
      );

      return null;
    }

    try {
      const stream = await this.fileStorageService.readFile({
        resourcePath: removeFileFolderFromFileEntityPath(file.path),
        fileFolder,
        applicationUniversalIdentifier: application.universalIdentifier,
        workspaceId,
      });

      const buffer = await streamToBuffer(stream);

      return {
        buffer,
        mimeType: file.mimeType,
      };
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
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
