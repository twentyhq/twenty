import { Injectable } from '@nestjs/common';

import { VerifyCallback } from 'passport-google-oauth20';

import { MicrosoftAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-common.auth.strategy';
import { MicrosoftAPIsRequest } from 'src/engine/core-modules/auth/types/microsoft-api-request.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export type MicrosoftAPIScopeConfig = {
  isCalendarEnabled?: boolean;
};

@Injectable()
export class MicrosoftAPIsOauthExchangeCodeForTokenStrategy extends MicrosoftAPIsOauthCommonStrategy {
  constructor(environmentService: EnvironmentService) {
    super(environmentService);
  }

  async validate(
    request: MicrosoftAPIsRequest,
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
