/* @license Enterprise */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

@Injectable()
export class SAMLAuthGuard extends AuthGuard('saml') {
  constructor(
    private readonly sSOService: SSOService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {
    super();
  }

  private getRelayStateByRequest(request: Request): {
    forceSubdomainUrl: boolean;
  } {
    try {
      const relayStateRaw = request.body.RelayState || request.query.RelayState;

      if (relayStateRaw) {
        const relayStateParsed = JSON.parse(relayStateRaw);

        return {
          forceSubdomainUrl:
            relayStateParsed.forceSubdomainUrl &&
            relayStateParsed.forceSubdomainUrl === 'true',
        };
      }

      return { forceSubdomainUrl: false };
    } catch (error) {
      this.exceptionHandlerService.captureExceptions(error);

      return { forceSubdomainUrl: false };
    }
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    let identityProvider:
      | (SSOConfiguration & WorkspaceSSOIdentityProvider)
      | null = null;

    const { forceSubdomainUrl } = this.getRelayStateByRequest(request);

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
      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.guardRedirectService.getSubdomainAndHostnameFromWorkspace(
          forceSubdomainUrl,
          identityProvider?.workspace,
        ),
      );

      return false;
    }
  }
}
