import { PassportStrategy } from '@nestjs/passport';

import { Strategy, type VerifyCallback } from 'passport-google-oauth20';

import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type GoogleAPIScopeConfig = {
  isCalendarEnabled?: boolean;
  isMessagingAliasFetchingEnabled?: boolean;
};

export abstract class GoogleAPIsOauthCommonStrategy extends PassportStrategy(
  Strategy,
  'google-apis',
) {
  constructor(twentyConfigService: TwentyConfigService) {
    const scopes = getGoogleApisOauthScopes();

    super({
      clientID: twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
      clientSecret: twentyConfigService.get('AUTH_GOOGLE_CLIENT_SECRET'),
      callbackURL: twentyConfigService.get('AUTH_GOOGLE_APIS_CALLBACK_URL'),
      scope: scopes,
      passReqToCallback: true,
    });
  }

  abstract validate(
    request: Express.Request,
    accessToken: string,
    refreshToken: string,
    profile: unknown,
    done: VerifyCallback,
  ): Promise<void>;
}
