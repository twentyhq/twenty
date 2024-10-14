import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { Auth0Strategy } from 'src/engine/core-modules/auth/strategies/auth0.auth.strategy';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class Auth0ProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('AUTH_AUTH0_ENABLED')) {
      throw new AuthException(
        'Auth0 auth is not enabled',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    new Auth0Strategy(this.environmentService);

    return true;
  }
}
