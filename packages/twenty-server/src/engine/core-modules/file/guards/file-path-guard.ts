import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { extractFileInfoFromRequest } from 'src/engine/core-modules/file/utils/extract-file-info-from-request.utils';
import {
  FileTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';

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
      const payload = await this.jwtWrapperService.verifyJwtToken(
        fileSignature,
        JwtTokenTypeEnum.FILE,
        ignoreExpirationToken ? { ignoreExpiration: true } : {},
      );

      if (
        !payload.workspaceId ||
        !payload.filename ||
        filename !== payload.filename
      ) {
        return false;
      }
    } catch (error) {
      return false;
    }

    const decodedPayload = this.jwtWrapperService.decode<FileTokenJwtPayload>(
      fileSignature,
      {
        json: true,
      },
    );

    request.workspaceId = decodedPayload.workspaceId;

    return true;
  }
}
