import { Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, type VerifyCallback } from 'passport-google-oauth20';

import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';
import { resolveGoogleApisCallbackUrl } from 'src/engine/core-modules/auth/utils/google-apis-callback-url.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type GoogleAPIScopeConfig = {
  isCalendarEnabled?: boolean;
  isMessagingAliasFetchingEnabled?: boolean;
};

export abstract class GoogleAPIsOauthCommonStrategy extends PassportStrategy(
  Strategy,
  'google-apis',
) {
  private readonly logger = new Logger(GoogleAPIsOauthCommonStrategy.name);

  constructor(twentyConfigService: TwentyConfigService) {
    const scopes = getGoogleApisOauthScopes();
    const configuredCallbackUrl = twentyConfigService.get(
      'AUTH_GOOGLE_APIS_CALLBACK_URL',
    );
    const serverUrl = twentyConfigService.get('SERVER_URL');

    const resolvedCallbackUrl = resolveGoogleApisCallbackUrl({
      callbackUrl: configuredCallbackUrl,
      serverUrl,
    });

    super({
      clientID: twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
      clientSecret: twentyConfigService.get('AUTH_GOOGLE_CLIENT_SECRET'),
      callbackURL: resolvedCallbackUrl.callbackUrl,
      scope: scopes,
      passReqToCallback: true,
    });

    if (resolvedCallbackUrl.normalizationReason === 'invalid_path') {
      this.logger.warn(
        `AUTH_GOOGLE_APIS_CALLBACK_URL has an invalid path and was normalized to ${resolvedCallbackUrl.callbackUrl}`,
      );
    }

    if (resolvedCallbackUrl.normalizationReason === 'invalid_url') {
      this.logger.warn(
        `AUTH_GOOGLE_APIS_CALLBACK_URL is invalid and fell back to ${resolvedCallbackUrl.callbackUrl}`,
      );
    }
  }

  abstract validate(
    request: Express.Request,
    accessToken: string,
    refreshToken: string,
    profile: unknown,
    done: VerifyCallback,
  ): Promise<void>;
}
