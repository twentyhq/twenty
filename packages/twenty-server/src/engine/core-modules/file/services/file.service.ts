import { Injectable } from '@nestjs/common';

import { Stream } from 'stream';

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
}
