/**
 * @license
 * Enterprise License
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Issuer } from 'openid-client';

import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { OIDCAuthStrategy } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

@Injectable()
export class OIDCAuthGuard extends AuthGuard('openidconnect') {
  constructor(private readonly ssoService: SSOService) {
    super();
  }

  private getIdentityProviderId(request: any): string {
    if (request.params.idpId) {
      return request.params.idpId;
    }

    if (
      request.query.state &&
      typeof request.query.state === 'string' &&
      request.query.state.startsWith('{') &&
      request.query.state.endsWith('}')
    ) {
      const state = JSON.parse(request.query.state);

      return state.idpId;
    }

    throw new Error('Invalid OIDC identity provider params');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const idpId = this.getIdentityProviderId(request);

      const idp = await this.ssoService.findSSOIdentityProviderById(idpId);

      if (!idp) {
        throw new AuthException(
          'Identity provider not found',
          AuthExceptionCode.INVALID_DATA,
        );
      }

      const issuer = await Issuer.discover(idp.issuer);

      new OIDCAuthStrategy(this.ssoService.getOIDCClient(idp, issuer), idp.id);

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
