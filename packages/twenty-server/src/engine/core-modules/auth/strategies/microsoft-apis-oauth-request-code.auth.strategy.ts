import { Injectable } from '@nestjs/common';

import { type VerifyCallback } from 'passport-google-oauth20';

import { MicrosoftAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-common.auth.strategy';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class MicrosoftAPIsOauthRequestCodeStrategy extends MicrosoftAPIsOauthCommonStrategy {
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate(req: any, options: any) {
    options = {
      ...options,
      accessType: 'offline',
      prompt: 'select_account',
      loginHint: req.params.loginHint,
      state: JSON.stringify({
        transientToken: req.params.transientToken,
        redirectLocation: req.params.redirectLocation,
        calendarVisibility: req.params.calendarVisibility,
        messageVisibility: req.params.messageVisibility,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    _request: Express.Request,
    _accessToken: string,
    _refreshToken: string,
    _profile: unknown,
    done: VerifyCallback,
  ): Promise<void> {
    // This strategy is only used for requesting authorization code
    // No validation is performed here
    done(null, {});
  }
}
