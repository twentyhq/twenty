import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type ServerFileTokenJwtPayload } from 'src/engine/core-modules/auth/types/server-file-token-jwt-payload.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

// Instance-level files have no workspace to check: the token alone names the
// registration whose file is served, so a workspace file token is refused.
@Injectable()
export class ServerFileByIdGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileId = request.params.id;
    const fileToken = request.query.token;

    if (!isNonEmptyString(fileToken)) {
      return false;
    }

    let payload: Partial<ServerFileTokenJwtPayload>;

    try {
      payload = await this.jwtWrapperService.verifyJwtToken(fileToken);
    } catch {
      return false;
    }

    if (
      payload.type !== JwtTokenTypeEnum.FILE ||
      !isNonEmptyString(payload.applicationRegistrationId) ||
      payload.fileId !== fileId
    ) {
      return false;
    }

    request.applicationRegistrationId = payload.applicationRegistrationId;

    return true;
  }
}
