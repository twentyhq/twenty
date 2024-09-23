import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { OIDCStrategy } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class OIDCProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('AUTH_OIDC_ENABLED')) {
      throw new AuthException(
        'OIDC auth is not enabled',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    new OIDCStrategy(this.environmentService);

    return true;
  }
}
