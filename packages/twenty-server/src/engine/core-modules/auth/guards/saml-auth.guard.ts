/* @license Enterprise */

import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { type Request } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { type SsoConfiguration } from 'src/engine/core-modules/sso/types/sso-configurations.type';
import { type WorkspaceSsoIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@Injectable()
export class SamlAuthGuard extends AuthGuard('saml') {
  constructor(
    private readonly ssoService: SsoService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    let identityProvider:
      | (SsoConfiguration & WorkspaceSsoIdentityProviderEntity)
      | null = null;

    try {
      identityProvider = await this.ssoService.findSsoIdentityProviderById(
        request.params.identityProviderId,
      );

      if (!identityProvider) {
        throw new AuthException(
          'Identity provider not found',
          AuthExceptionCode.INVALID_DATA,
        );
      }
      new SamlAuthStrategy(this.ssoService);

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.workspaceDomainsService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
          identityProvider?.workspace,
        ),
      );

      return false;
    }
  }
}
