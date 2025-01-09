/* @license Enterprise */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';

@Injectable()
export class SAMLAuthGuard extends AuthGuard('saml') {
  constructor(private readonly sSOService: SSOService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();

      if (!request.params.identityProviderId) {
        throw new AuthException(
          'Invalid SAML identity provider',
          AuthExceptionCode.INVALID_DATA,
        );
      }

      new SamlAuthStrategy(this.sSOService);

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
