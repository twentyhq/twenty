import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  createOidcClient,
  OidcSocialStrategy,
} from 'src/engine/core-modules/auth/strategies/oidc-sso.auth.strategy';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class OidcSocialProviderEnabledGuard implements CanActivate {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly guardRedirectService: GuardRedirectService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (!this.twentyConfigService.get('AUTH_OIDC_ENABLED')) {
        throw new AuthException(
          'Generic OIDC authentication is not enabled',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      const client = await createOidcClient(this.twentyConfigService);
      const scopes = this.twentyConfigService.get('AUTH_OIDC_SCOPES');

      new OidcSocialStrategy(client, scopes);

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
