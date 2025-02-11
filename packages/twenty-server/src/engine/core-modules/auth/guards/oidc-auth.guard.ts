/* @license Enterprise */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Issuer } from 'openid-client';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { OIDCAuthStrategy } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@Injectable()
export class OIDCAuthGuard extends AuthGuard('openidconnect') {
  constructor(
    private readonly sSOService: SSOService,
    private readonly guardRedirectService: GuardRedirectService,
  ) {
    super();
  }

  private getStateByRequest(request: any): {
    identityProviderId: string;
  } {
    if (request.params.identityProviderId) {
      return request.params.identityProviderId;
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
      | (SSOConfiguration & WorkspaceSSOIdentityProvider)
      | null = null;

    try {
      const state = this.getStateByRequest(request);

      identityProvider = await this.sSOService.findSSOIdentityProviderById(
        state.identityProviderId,
      );

      if (!identityProvider) {
        throw new AuthException(
          'Identity provider not found',
          AuthExceptionCode.INVALID_DATA,
        );
      }

      const issuer = await Issuer.discover(identityProvider.issuer);

      new OIDCAuthStrategy(
        this.sSOService.getOIDCClient(identityProvider, issuer),
        identityProvider.id,
      );

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.guardRedirectService.getSubdomainAndCustomDomainFromWorkspace(
          identityProvider?.workspace,
        ),
      );

      return false;
    }
  }
}
