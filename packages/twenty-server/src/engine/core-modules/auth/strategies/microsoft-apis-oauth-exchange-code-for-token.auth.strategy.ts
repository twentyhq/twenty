import { Injectable } from '@nestjs/common';

import { type VerifyCallback } from 'passport-google-oauth20';

import { MicrosoftAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-common.auth.strategy';
import { type MicrosoftAPIsRequest } from 'src/engine/core-modules/auth/types/microsoft-api-request.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type MicrosoftAPIScopeConfig = {
  isCalendarEnabled?: boolean;
};

@Injectable()
export class MicrosoftAPIsOauthExchangeCodeForTokenStrategy extends MicrosoftAPIsOauthCommonStrategy {
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  async validate(
    request: MicrosoftAPIsRequest,
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

    const user: MicrosoftAPIsRequest['user'] = {
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
