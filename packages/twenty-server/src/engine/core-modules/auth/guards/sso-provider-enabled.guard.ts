/* @license Enterprise */

import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class SSOProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('ENTERPRISE_KEY')) {
      throw new AuthException(
        'Enterprise key must be defined to use SSO',
        AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE,
      );
    }

    return true;
  }
}
