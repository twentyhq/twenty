import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
    const request = context.switchToHttp().getRequest();
    const state = JSON.parse(request.query.state);

    new MicrosoftAPIsOauthExchangeCodeForTokenStrategy(this.environmentService);

    setRequestExtraParams(request, {
      transientToken: state.transientToken,
      redirectLocation: state.redirectLocation,
      calendarVisibility: state.calendarVisibility,
      messageVisibility: state.messageVisibility,
    });

    return (await super.canActivate(context)) as boolean;
  }
}
