import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { type FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/auth-context.type';
import { extractFileInfoFromRequest } from 'src/engine/core-modules/file/utils/extract-file-info-from-request.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

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
        ignoreExpirationToken ? { ignoreExpiration: true } : {},
      );

      if (
        !payload.workspaceId ||
        !payload.filename ||
        filename !== payload.filename
      ) {
        return false;
      }
    } catch {
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
