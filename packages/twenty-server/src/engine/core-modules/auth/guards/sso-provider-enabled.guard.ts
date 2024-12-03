/* @license Enterprise */

import { CanActivate, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  EnvironmentException,
  EnvironmentExceptionCode,
} from 'src/engine/core-modules/environment/environment.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class SSOProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('ENTERPRISE_KEY')) {
      throw new EnvironmentException(
        'Enterprise key must be defined to use SSO',
        EnvironmentExceptionCode.ENVIRONMENT_VARIABLES_NOT_FOUND,
      );
    }

    return true;
  }
}
