import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type JwtPayload } from 'src/engine/core-modules/auth/types/jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { getRequest } from 'src/utils/extract-request';

// Rejects requests whose JWT type is not ACCESS. Use on endpoints that mint
// derived credentials so short-lived derived tokens (PLAYGROUND, etc.) cannot
// renew themselves indefinitely.
@Injectable()
export class RequireAccessTokenGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = getRequest(context);

    if (!request) return false;

    const token = this.jwtWrapperService.extractJwtFromRequest()(request);

    if (!token) {
      throw new AuthException(
        'Missing authentication token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const payload = this.jwtWrapperService.decode<JwtPayload>(token);

    if (payload?.type !== JwtTokenTypeEnum.ACCESS) {
      throw new AuthException(
        'This endpoint requires a session access token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return true;
  }
}
