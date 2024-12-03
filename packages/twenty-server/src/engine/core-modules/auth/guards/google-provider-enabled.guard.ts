import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { GoogleStrategy } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import {
  EnvironmentException,
  EnvironmentExceptionCode,
} from 'src/engine/core-modules/environment/environment.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class GoogleProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('AUTH_GOOGLE_ENABLED')) {
      throw new EnvironmentException(
        'Google auth is not enabled',
        EnvironmentExceptionCode.ENVIRONMENT_VARIABLES_NOT_FOUND,
      );
    }

    new GoogleStrategy(this.environmentService);

    return true;
  }
}
