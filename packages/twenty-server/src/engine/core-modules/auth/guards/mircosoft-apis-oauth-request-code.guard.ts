import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MicrosoftAPIsOauthRequestCodeStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-request-code.auth.strategy';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class MicrosoftAPIsOauthRequestCodeGuard extends AuthGuard(
  'microsoft-apis',
) {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly tokenService: TokenService,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    new MicrosoftAPIsOauthRequestCodeStrategy(this.environmentService);
    setRequestExtraParams(request, {
      transientToken: request.query.transientToken,
      redirectLocation: request.query.redirectLocation,
      calendarVisibility: request.query.calendarVisibility,
      messageVisibility: request.query.messageVisibility,
      loginHint: request.query.loginHint,
    });

    const activate = (await super.canActivate(context)) as boolean;

    return activate;
  }
}
