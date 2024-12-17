import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { MicrosoftStrategy } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class MicrosoftProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('AUTH_MICROSOFT_ENABLED')) {
      throw new AuthException(
        'Microsoft auth is not enabled',
        AuthExceptionCode.MICROSOFT_API_AUTH_DISABLED,
      );
    }

    new MicrosoftStrategy(this.environmentService);

    return true;
  }
}
