import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';

import { type ApplicationRegistrationVersionArtifactTokenJwtPayload } from 'src/engine/core-modules/auth/types/application-registration-version-artifact-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class ApplicationRegistrationVersionArtifactGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.query.token;

    if (!isNonEmptyString(token)) {
      return false;
    }

    try {
      const payload: ApplicationRegistrationVersionArtifactTokenJwtPayload =
        await this.jwtWrapperService.verifyJwtToken(token);

      return (
        payload.type ===
          JwtTokenTypeEnum.APPLICATION_REGISTRATION_VERSION_ARTIFACT &&
        payload.applicationRegistrationVersionId ===
          request.params.applicationRegistrationVersionId
      );
    } catch {
      return false;
    }
  }
}
