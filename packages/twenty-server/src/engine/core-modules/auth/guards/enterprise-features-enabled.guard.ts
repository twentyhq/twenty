/* @license Enterprise */

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EnterpriseKeyService } from 'src/engine/core-modules/enterprise/services/enterprise-key.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';

@Injectable()
export class EnterpriseFeaturesEnabledGuard implements CanActivate {
  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    private readonly enterpriseKeyService: EnterpriseKeyService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      if (!this.enterpriseKeyService.isValid()) {
        throw new AuthException(
          'Enterprise license is not active',
          AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE,
        );
      }

      return true;
    } catch (err) {
      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.guardRedirectService.getSubdomainAndCustomDomainFromContext(
          context,
        ),
      );

      return false;
    }
  }
}
