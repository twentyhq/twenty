import { Injectable } from '@nestjs/common';

import { basename, dirname, extname } from 'path';
import { type Readable } from 'stream';

import { isNonEmptyString } from '@sniptt/guards';
import { buildSignedPath } from 'twenty-shared/utils';
import { v4 as uuidV4 } from 'uuid';

import {
  type FileTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { extractFolderPathAndFilename } from 'src/engine/core-modules/file/utils/extract-folderpath-and-filename.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class FileService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly fileStorageService: FileStorageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getFileStream(
    folderPath: string,
    filename: string,
    workspaceId: string,
  ): Promise<Readable> {
    const workspaceFolderPath = `workspace-${workspaceId}/${folderPath}`;

    return await this.fileStorageService.read({
      folderPath: workspaceFolderPath,
      filename,
    });
  }

  signFileUrl({ url, workspaceId }: { url: string; workspaceId: string }) {
    if (!isNonEmptyString(url)) {
      return url;
    }

    return buildSignedPath({
      path: url,
      token: this.encodeFileToken({
        filename: extractFolderPathAndFilename(url).filename,
        workspaceId,
      }),
    });
  }

  encodeFileToken(payloadToEncode: Omit<FileTokenJwtPayload, 'type' | 'sub'>) {
    const fileTokenExpiresIn = this.twentyConfigService.get(
      'FILE_TOKEN_EXPIRES_IN',
    );

    const payload: FileTokenJwtPayload = {
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

    return await this.fileStorageService.delete({
      folderPath: workspaceFolderPath,
      filename,
    });
  }

  async deleteWorkspaceFolder(workspaceId: string) {
    const workspaceFolderPath = `workspace-${workspaceId}`;

    const isWorkspaceFolderFound =
      await this.fileStorageService.checkFolderExists(workspaceFolderPath);

    if (!isWorkspaceFolderFound) {
      return;
    }

    return await this.fileStorageService.delete({
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

    await this.fileStorageService.copy({
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
