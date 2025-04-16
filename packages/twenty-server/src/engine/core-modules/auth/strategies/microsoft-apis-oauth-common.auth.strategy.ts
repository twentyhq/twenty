import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-microsoft';

import { getMicrosoftApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-microsoft-apis-oauth-scopes';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type MicrosoftAPIScopeConfig = {
  isCalendarEnabled?: boolean;
  isMessagingAliasFetchingEnabled?: boolean;
};

@Injectable()
export class MicrosoftAPIsOauthCommonStrategy extends PassportStrategy(
  Strategy,
  'microsoft-apis',
) {
  constructor(twentyConfigService: TwentyConfigService) {
    const scopes = getMicrosoftApisOauthScopes();

    super({
      clientID: twentyConfigService.get('AUTH_MICROSOFT_CLIENT_ID'),
      clientSecret: twentyConfigService.get('AUTH_MICROSOFT_CLIENT_SECRET'),
      tenant: 'common',
      callbackURL: twentyConfigService.get('AUTH_MICROSOFT_APIS_CALLBACK_URL'),
      scope: scopes,
      passReqToCallback: true,
    });
  }
}
