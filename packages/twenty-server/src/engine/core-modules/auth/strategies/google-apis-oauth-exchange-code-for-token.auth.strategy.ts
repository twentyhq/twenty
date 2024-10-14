import { Injectable } from '@nestjs/common';

import { VerifyCallback } from 'passport-google-oauth20';

import { GoogleAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-common.auth.strategy';
import { GoogleAPIsRequest } from 'src/engine/core-modules/auth/types/google-api-request.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export type GoogleAPIScopeConfig = {
  isCalendarEnabled?: boolean;
};

@Injectable()
export class GoogleAPIsOauthExchangeCodeForTokenStrategy extends GoogleAPIsOauthCommonStrategy {
  constructor(
    environmentService: EnvironmentService,
    scopeConfig: GoogleAPIScopeConfig,
    isGmailSendEmailScopeEnabled = false,
  ) {
    super(environmentService, scopeConfig, isGmailSendEmailScopeEnabled);
  }

  async validate(
    request: GoogleAPIsRequest,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;

    const state =
      typeof request.query.state === 'string'
        ? JSON.parse(request.query.state)
        : undefined;

    const user: GoogleAPIsRequest['user'] = {
      emails,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
      transientToken: state.transientToken,
      redirectLocation: state.redirectLocation,
      calendarVisibility: state.calendarVisibility,
      messageVisibility: state.messageVisibility,
    };

    done(null, user);
  }
}
