import { Injectable } from '@nestjs/common';

import {
  type Profile as GoogleProfile,
  type VerifyCallback,
} from 'passport-google-oauth20';
import { parseJson } from 'twenty-shared/utils';

import { GoogleAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-common.auth.strategy';
import { type APIsOAuthRequest } from 'src/engine/core-modules/auth/types/apis-oauth-request.type';
import { type APIsOAuthState } from 'src/engine/core-modules/auth/types/apis-oauth-state.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class GoogleAPIsOauthExchangeCodeForTokenStrategy extends GoogleAPIsOauthCommonStrategy {
  constructor(
    twentyConfigService: TwentyConfigService,
    isDraftEmailEnabled = false,
  ) {
    super(twentyConfigService, isDraftEmailEnabled);
  }

  async validate(
    request: APIsOAuthRequest,
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;
    const state = parseJson<APIsOAuthState>(request.query.state as string);

    const user: APIsOAuthRequest['user'] = {
      emails: emails ?? [],
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value ?? null,
      accessToken,
      refreshToken,
      transientToken: state?.transientToken ?? '',
      redirectLocation: state?.redirectLocation,
      calendarVisibility: state?.calendarVisibility,
      messageVisibility: state?.messageVisibility,
      skipMessageChannelConfiguration: state?.skipMessageChannelConfiguration,
    };

    done(null, user);
  }
}
