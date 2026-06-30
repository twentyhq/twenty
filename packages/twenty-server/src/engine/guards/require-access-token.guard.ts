import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class RequireAccessTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = getRequest(context);

    if (!request) return false;

    if (request.tokenType !== JwtTokenTypeEnum.ACCESS) {
      throw new AuthException(
        'This endpoint requires a session access token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return true;
  }
}
