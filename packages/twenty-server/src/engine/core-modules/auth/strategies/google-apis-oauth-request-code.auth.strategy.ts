import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type VerifyCallback } from 'passport-google-oauth20';

import { GoogleAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-common.auth.strategy';
import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';
import { getGoogleEmailForwardingOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-email-forwarding-oauth-scopes';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type GoogleApiScopeConfig = {
  isCalendarEnabled?: boolean;
  isMessagingAliasFetchingEnabled?: boolean;
};

@Injectable()
export class GoogleAPIsOauthRequestCodeStrategy extends GoogleAPIsOauthCommonStrategy {
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  authenticate(req: any, options: any) {
    const emailForwardingMessageChannelId =
      req.params.emailForwardingMessageChannelId;
    const isEmailForwardingGrant = isNonEmptyString(
      emailForwardingMessageChannelId,
    );

    options = {
      ...options,
      accessType: isEmailForwardingGrant ? 'online' : 'offline',
      prompt: 'consent',
      loginHint: req.params.loginHint,
      scope: isEmailForwardingGrant
        ? getGoogleEmailForwardingOauthScopes()
        : getGoogleApisOauthScopes(),
      state: JSON.stringify({
        transientToken: req.params.transientToken,
        redirectLocation: req.params.redirectLocation,
        calendarVisibility: req.params.calendarVisibility,
        messageVisibility: req.params.messageVisibility,
        skipMessageChannelConfiguration:
          req.params.skipMessageChannelConfiguration,
        emailForwardingMessageChannelId,
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
