import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { MicrosoftAPIsOauthExchangeCodeForTokenStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-exchange-code-for-token.auth.strategy';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class MicrosoftAPIsOauthExchangeCodeForTokenGuard extends AuthGuard(
  'microsoft-apis',
) {
  constructor(private readonly environmentService: EnvironmentService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const state = JSON.parse(request.query.state);

      new MicrosoftAPIsOauthExchangeCodeForTokenStrategy(
        this.environmentService,
      );

      setRequestExtraParams(request, {
        transientToken: state.transientToken,
        redirectLocation: state.redirectLocation,
        calendarVisibility: state.calendarVisibility,
        messageVisibility: state.messageVisibility,
      });

      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      if (error?.oauthError?.statusCode === 403) {
        throw new AuthException(
          `Insufficient privileges to access this microsoft resource. Make sure you have the correct scopes or ask your admin to update your scopes. ${error?.message}`,
          AuthExceptionCode.INSUFFICIENT_SCOPES,
        );
      }

      return false;
    }
  }
}
