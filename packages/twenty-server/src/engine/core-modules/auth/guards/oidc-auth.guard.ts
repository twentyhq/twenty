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

@Injectable()
export class OIDCAuthGuard extends AuthGuard('openidconnect') {
  constructor(private readonly ssoService: SSOService) {
    super();
  }

  private getIdentityProviderId(request: any): string {
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

      return state.identityProviderId;
    }

    throw new Error('Invalid OIDC identity provider params');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const identityProviderId = this.getIdentityProviderId(request);

      const identityProvider =
        await this.ssoService.findSSOIdentityProviderById(identityProviderId);

      if (!identityProvider) {
        throw new AuthException(
          'Identity provider not found',
          AuthExceptionCode.INVALID_DATA,
        );
      }

      const issuer = await Issuer.discover(identityProvider.issuer);

      new OIDCAuthStrategy(
        this.ssoService.getOIDCClient(identityProvider, issuer),
        identityProvider.id,
      );

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      if (err instanceof AuthException) {
        return false;
      }

      // TODO AMOREAUX: trigger sentry error
      return false;
    }
  }
}
