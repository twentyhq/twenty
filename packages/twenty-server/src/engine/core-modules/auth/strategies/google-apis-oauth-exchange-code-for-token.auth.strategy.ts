import { Injectable } from '@nestjs/common';

import { type VerifyCallback } from 'passport-google-oauth20';

import { GoogleAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-common.auth.strategy';
import { type GoogleAPIsRequest } from 'src/engine/core-modules/auth/types/google-api-request.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type GoogleAPIScopeConfig = {
  isCalendarEnabled?: boolean;
};

@Injectable()
export class GoogleAPIsOauthExchangeCodeForTokenStrategy extends GoogleAPIsOauthCommonStrategy {
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  async validate(
    request: GoogleAPIsRequest,
    accessToken: string,
    refreshToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
