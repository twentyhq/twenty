import { Injectable } from '@nestjs/common';

import { type VerifyCallback } from 'passport-google-oauth20';

import { MicrosoftAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-common.auth.strategy';
import { type APIsOAuthRequest } from 'src/engine/core-modules/auth/types/apis-oauth-request.type';
import { type APIsOAuthState } from 'src/engine/core-modules/auth/types/apis-oauth-state.type';
import { type MicrosoftPassportProfile } from 'src/engine/core-modules/auth/types/microsoft-passport-profile.type';
import { parseOAuthState } from 'src/engine/core-modules/auth/utils/parse-oauth-state.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class MicrosoftAPIsOauthExchangeCodeForTokenStrategy extends MicrosoftAPIsOauthCommonStrategy {
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  async validate(
    request: APIsOAuthRequest,
    accessToken: string,
    refreshToken: string,
    profile: MicrosoftPassportProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;
    const state = parseOAuthState<APIsOAuthState>(request.query.state);

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
