import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { MicrosoftStrategy } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import {
  EnvironmentException,
  EnvironmentExceptionCode,
} from 'src/engine/core-modules/environment/environment.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class MicrosoftProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('AUTH_MICROSOFT_ENABLED')) {
      throw new EnvironmentException(
        'Microsoft auth is not enabled',
        EnvironmentExceptionCode.ENVIRONMENT_VARIABLES_NOT_FOUND,
      );
    }

    new MicrosoftStrategy(this.environmentService);

    return true;
  }
}
