import { Injectable } from '@nestjs/common';

import { Stream } from 'stream';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

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
    const secret = this.environmentService.get('FILE_TOKEN_SECRET');

    const expirationDate = addMilliseconds(new Date(), ms(fileTokenExpiresIn));

    const signedPayload = this.jwtWrapperService.sign(
      {
        expiration_date: expirationDate,
        ...payloadToEncode,
      },
      {
        secret,
      },
    );

    return signedPayload;
  }
}
