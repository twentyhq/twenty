/* @license Enterprise */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { GuardErrorManagerService } from 'src/engine/core-modules/guard-manager/services/guard-error-manager.service';

@Injectable()
export class SAMLAuthGuard extends AuthGuard('saml') {
  constructor(
    private readonly sSOService: SSOService,
    private readonly guardErrorManagerService: GuardErrorManagerService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    let identityProvider: Awaited<
      ReturnType<typeof this.sSOService.findSSOIdentityProviderById>
    >;

    try {
      identityProvider = await this.sSOService.findSSOIdentityProviderById(
        request.params.identityProviderId,
      );

      if (!identityProvider) {
        throw new AuthException(
          'Identity provider not found',
          AuthExceptionCode.INVALID_DATA,
        );
      }
      new SamlAuthStrategy(this.sSOService);

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.guardErrorManagerService.dispatchErrorFromGuard(context, err, {
        subdomain: identityProvider?.workspace.subdomain,
      });

      return false;
    }
  }
}
