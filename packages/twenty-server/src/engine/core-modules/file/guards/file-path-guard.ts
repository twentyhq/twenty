import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { checkFileFolder } from 'src/engine/core-modules/file/file.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { FilePayloadToEncode } from 'src/engine/core-modules/file/services/file.service';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileFolder = checkFileFolder(request.params[0]);
    const filename = request.params.filename;
    const ignoreExpirationToken =
      fileFolderConfigs[fileFolder].ignoreExpirationToken;

    const query = request.query;

    const fileSignature = query['token'];

    if (!query || !fileSignature) {
      return false;
    }

    try {
      const payload = (await this.jwtWrapperService.verifyWorkspaceToken(
        fileSignature,
        'FILE',
        ignoreExpirationToken ? { ignoreExpiration: true } : {},
      )) as FilePayloadToEncode;

      if (
        !payload.workspaceId ||
        !payload.fileId ||
        filename !== payload.fileId
      ) {
        return false;
      }
    } catch (error) {
      return false;
    }

    const decodedPayload = (await this.jwtWrapperService.decode(fileSignature, {
      json: true,
    })) as FilePayloadToEncode;

    request.workspaceId = decodedPayload.workspaceId;

    return true;
  }
}
