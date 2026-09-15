import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { FileUploadTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-upload-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class FileUploadTokenGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileId = request.params.id;
    const uploadToken = request.query.token;

    if (!uploadToken) {
      return false;
    }

    let payload: FileUploadTokenJwtPayload;

    try {
      payload = await this.jwtWrapperService.verifyJwtToken(uploadToken);
    } catch {
      return false;
    }

    // A FILE (download) token also carries workspaceId + fileId: reject
    // anything that is not explicitly an upload token.
    if (payload.type !== JwtTokenTypeEnum.FILE_UPLOAD) {
      return false;
    }

    if (!payload.workspaceId || payload.fileId !== fileId) {
      return false;
    }

    request.workspaceId = payload.workspaceId;

    return true;
  }
}
