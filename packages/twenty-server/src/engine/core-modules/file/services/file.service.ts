import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname, extname } from 'path';
import { type Readable } from 'stream';

import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import {
  buildSignedPath,
  extractFolderPathFilenameAndTypeOrThrow,
} from 'twenty-shared/utils';
import { Like, Repository } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  type FileTokenJwtPayloadLegacy,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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

  async getFileStream(
    folderPath: string,
    filename: string,
    workspaceId: string,
  ): Promise<Readable> {
    const workspaceFolderPath = `workspace-${workspaceId}/${folderPath}`;

    return await this.fileStorageService.readFileLegacy({
      filePath: `${workspaceFolderPath}/${filename}`,
    });
  }

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
  }) {
    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: applicationId,
        workspaceId,
      },
    });

    return this.fileStorageService.readFile({
      resourcePath: filepath,
      fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
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
  }): Promise<Readable> {
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

    return this.fileStorageService.readFile({
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
      fileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
    });
  }

  signFileUrl({ url, workspaceId }: { url: string; workspaceId: string }) {
    if (!isNonEmptyString(url)) {
      return url;
    }

    return buildSignedPath({
      path: url,
      token: this.encodeFileToken({
        filename: extractFolderPathFilenameAndTypeOrThrow(url).filename,
        workspaceId,
      }),
    });
  }

  encodeFileToken(
    payloadToEncode: Omit<FileTokenJwtPayloadLegacy, 'type' | 'sub'>,
  ) {
    const fileTokenExpiresIn = this.twentyConfigService.get(
      'FILE_TOKEN_EXPIRES_IN',
    );

    const payload: FileTokenJwtPayloadLegacy = {
      ...payloadToEncode,
      sub: payloadToEncode.workspaceId,
      type: JwtTokenTypeEnum.FILE,
    };

    const secret = this.jwtWrapperService.generateAppSecret(
      payload.type,
      payloadToEncode.workspaceId,
    );

    return this.jwtWrapperService.sign(payload, {
      secret,
      expiresIn: fileTokenExpiresIn,
    });
  }

  async deleteFile({
    folderPath,
    filename,
    workspaceId,
  }: {
    folderPath: string;
    filename: string;
    workspaceId: string;
  }) {
    const workspaceFolderPath = `workspace-${workspaceId}/${folderPath}`;

    return await this.fileStorageService.deleteLegacy({
      folderPath: workspaceFolderPath,
      filename,
    });
  }

  async deleteWorkspaceFolder(workspaceId: string) {
    const workspaceFolderPath = `workspace-${workspaceId}`;

    const isWorkspaceFolderFound =
      await this.fileStorageService.checkFolderExistsLegacy({
        folderPath: workspaceFolderPath,
      });

    if (!isWorkspaceFolderFound) {
      return;
    }

    return await this.fileStorageService.deleteLegacy({
      folderPath: workspaceFolderPath,
    });
  }

  async copyFileFromWorkspaceToWorkspace(
    fromWorkspaceId: string,
    fromPath: string,
    toWorkspaceId: string,
  ) {
    const subFolder = dirname(fromPath);
    const fromWorkspaceFolderPath = `workspace-${fromWorkspaceId}`;
    const toWorkspaceFolderPath = `workspace-${toWorkspaceId}`;
    const fromFilename = basename(fromPath);

    const toFilename = uuidV4() + extname(fromFilename);

    await this.fileStorageService.copyLegacy({
      from: {
        folderPath: `${fromWorkspaceFolderPath}/${subFolder}`,
        filename: fromFilename,
      },
      to: {
        folderPath: `${toWorkspaceFolderPath}/${subFolder}`,
        filename: toFilename,
      },
    });

    return [toWorkspaceFolderPath, subFolder, toFilename];
  }
}
