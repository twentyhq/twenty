import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { GoogleAPIsOauthExchangeCodeForTokenStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-exchange-code-for-token.auth.strategy';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';

@Injectable()
export class GoogleAPIsOauthExchangeCodeForTokenGuard extends AuthGuard(
  'google-apis',
) {
  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    private readonly environmentService: EnvironmentService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const state = JSON.parse(request.query.state);

      if (
        !this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED') &&
        !this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')
      ) {
        throw new AuthException(
          'Google apis auth is not enabled',
          AuthExceptionCode.GOOGLE_API_AUTH_DISABLED,
        );
      }

      new GoogleAPIsOauthExchangeCodeForTokenStrategy(this.environmentService);

      setRequestExtraParams(request, {
        transientToken: state.transientToken,
        redirectLocation: state.redirectLocation,
        calendarVisibility: state.calendarVisibility,
        messageVisibility: state.messageVisibility,
      });

      return (await super.canActivate(context)) as boolean;
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
