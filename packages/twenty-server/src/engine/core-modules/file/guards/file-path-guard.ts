import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { FilePayloadToEncode } from 'src/engine/core-modules/file/services/file.service';
import { extractFileInfoFromRequest } from 'src/engine/core-modules/file/utils/extract-file-info-from-request.utils';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { filename, fileSignature, ignoreExpirationToken } =
      extractFileInfoFromRequest(request);

    if (!fileSignature) {
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
        !filename.includes(payload.fileId)
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
