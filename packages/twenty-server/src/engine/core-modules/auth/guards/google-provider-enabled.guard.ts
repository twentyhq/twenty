import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { GoogleStrategy } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class GoogleProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('AUTH_GOOGLE_ENABLED')) {
      throw new AuthException(
        'Google auth is not enabled',
        AuthExceptionCode.GOOGLE_API_AUTH_DISABLED,
      );
    }

    new GoogleStrategy(this.environmentService);

    return true;
  }
}
