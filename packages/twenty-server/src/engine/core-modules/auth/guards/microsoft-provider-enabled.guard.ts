import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { MicrosoftStrategy } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { GuardErrorManagerService } from 'src/engine/core-modules/guard-manager/services/guard-error-manager.service';

@Injectable()
export class MicrosoftProviderEnabledGuard implements CanActivate {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly guardErrorManagerService: GuardErrorManagerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    try {
      if (!this.environmentService.get('AUTH_MICROSOFT_ENABLED')) {
        throw new AuthException(
          'Microsoft auth is not enabled',
          AuthExceptionCode.MICROSOFT_API_AUTH_DISABLED,
        );
      }

      new MicrosoftStrategy(this.environmentService);

      return true;
    } catch (err) {
      this.guardErrorManagerService.dispatchErrorFromGuard(context, err, {
        baseUrl: request.query?.origin_url,
      });

      return false;
    }
  }
}
