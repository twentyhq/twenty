import { Injectable } from '@nestjs/common';

import { basename, dirname } from 'path';
import { Stream } from 'stream';

import { v4 as uuidV4 } from 'uuid';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
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
  ): Promise<Stream> {
    const workspaceFolderPath = `workspace-${workspaceId}/${folderPath}`;

    return await this.fileStorageService.read({
      folderPath: workspaceFolderPath,
      filename,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encodeFileToken(payloadToEncode: Record<string, any>) {
    const fileTokenExpiresIn = this.twentyConfigService.get(
      'FILE_TOKEN_EXPIRES_IN',
    );
    const secret = this.jwtWrapperService.generateAppSecret(
      'FILE',
      payloadToEncode.workspaceId,
    );

    const signedPayload = this.jwtWrapperService.sign(
      {
        ...payloadToEncode,
      },
      {
        secret,
        expiresIn: fileTokenExpiresIn,
      },
    );

    return signedPayload;
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

    return await this.fileStorageService.delete({
      folderPath: workspaceFolderPath,
    });
  }

  async copyFileToNewWorkspace(
    fromWorkspaceId: string,
    fromPath: string,
    toWorkspaceId: string,
  ) {
    const subFolder = dirname(fromPath);
    const fromWorkspaceFolderPath = `workspace-${fromWorkspaceId}`;
    const toWorkspaceFolderPath = `workspace-${toWorkspaceId}`;
    const fromFilename = basename(fromPath);

    const ext = fromFilename.split('.')?.[1];
    const id = uuidV4();
    const toFilename = `${id}${ext ? `.${ext}` : ''}`;

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
