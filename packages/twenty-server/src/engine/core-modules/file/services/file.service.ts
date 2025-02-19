import { Injectable } from '@nestjs/common';

import { Stream } from 'stream';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class FileService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly fileStorageService: FileStorageService,
    private readonly environmentService: EnvironmentService,
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

  async encodeFileToken(payloadToEncode: Record<string, any>) {
    const fileTokenExpiresIn = this.environmentService.get(
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
}
