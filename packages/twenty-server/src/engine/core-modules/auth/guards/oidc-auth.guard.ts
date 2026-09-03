/* @license Enterprise */

import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Issuer } from 'openid-client';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { OidcAuthStrategy } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { type SsoConfiguration } from 'src/engine/core-modules/sso/types/sso-configurations.type';
import { type WorkspaceSsoIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@Injectable()
export class OidcAuthGuard extends AuthGuard('openidconnect') {
  constructor(
    private readonly ssoService: SsoService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {
    super();
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  private getStateByRequest(request: any): {
    identityProviderId: string;
  } {
    if (request.params.identityProviderId) {
      return {
        identityProviderId: request.params.identityProviderId,
      };
    }

    if (
      request.query.state &&
      typeof request.query.state === 'string' &&
      request.query.state.startsWith('{') &&
      request.query.state.endsWith('}')
    ) {
      const state = JSON.parse(request.query.state);

      return {
        identityProviderId: state.identityProviderId,
      };
    }

    throw new Error('Invalid OIDC identity provider params');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    let identityProvider:
      | (SsoConfiguration & WorkspaceSsoIdentityProviderEntity)
      | null = null;

    try {
      const state = this.getStateByRequest(request);

      if (!state.identityProviderId) {
        throw new AuthException(
          'identityProviderId missing',
          AuthExceptionCode.INVALID_DATA,
        );
      }

      identityProvider = await this.ssoService.findSsoIdentityProviderById(
        state.identityProviderId,
      );

      if (!identityProvider) {
        throw new AuthException(
          'Identity provider not found',
          AuthExceptionCode.INVALID_DATA,
        );
      }
      const issuer = await Issuer.discover(identityProvider.issuer);

      new OidcAuthStrategy(
        this.ssoService.getOidcClient(identityProvider, issuer),
        identityProvider.id,
      );

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
