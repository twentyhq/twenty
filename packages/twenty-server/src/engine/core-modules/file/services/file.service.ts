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
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

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
  }): Promise<{ stream: Readable; mimeType: string } | null> {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
        workspaceId,
      },
    });

    if (application === null) {
      return null;
    }

    const file = await this.fileRepository.findOne({
      where: {
        path: `${fileFolder}/${filepath}`,
        workspaceId,
        applicationId,
      },
    });

    if (file === null) {
      return null;
    }

    try {
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

  async getFileStreamById({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<{ stream: Readable; mimeType: string } | null> {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
        workspaceId,
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

  async getFileResponseById(params: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<FileResponse | null> {
    const file = await this.fileRepository.findOne({
      where: {
        id: params.fileId,
        workspaceId: params.workspaceId,
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
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
        workspaceId,
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
        mimeType: file.mimeType ?? 'application/octet-stream',
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
