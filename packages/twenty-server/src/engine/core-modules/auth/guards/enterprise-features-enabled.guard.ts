/* @license Enterprise */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { GuardErrorManagerService } from 'src/engine/core-modules/guard-manager/services/guard-error-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class EnterpriseFeaturesEnabledGuard implements CanActivate {
  constructor(
    private readonly guardErrorManagerService: GuardErrorManagerService,
    private readonly environmentService: EnvironmentService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const response = context.switchToHttp().getResponse();

    try {
      if (!this.environmentService.get('ENTERPRISE_KEY')) {
        throw new AuthException(
          'Enterprise key missing',
          AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE,
        );
      }

      return true;
    } catch (err) {
      this.guardErrorManagerService.dispatchErrorFromGuard(context, err);

      return false;
    }
  }
}
