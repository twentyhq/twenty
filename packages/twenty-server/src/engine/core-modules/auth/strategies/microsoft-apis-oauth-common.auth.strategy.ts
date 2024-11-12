import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-microsoft';

import { getMicrosoftApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-microsoft-apis-oauth-scopes';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export type MicrosoftAPIScopeConfig = {
  isCalendarEnabled?: boolean;
  isMessagingAliasFetchingEnabled?: boolean;
};

@Injectable()
export class MicrosoftAPIsOauthCommonStrategy extends PassportStrategy(
  Strategy,
  'microsoft-apis',
) {
  constructor(environmentService: EnvironmentService) {
    const scopes = getMicrosoftApisOauthScopes();

    super({
      clientID: environmentService.get('AUTH_MICROSOFT_CLIENT_ID'),
      clientSecret: environmentService.get('AUTH_MICROSOFT_CLIENT_SECRET'),
      tenant: environmentService.get('AUTH_MICROSOFT_TENANT_ID'),
      callbackURL: environmentService.get('AUTH_MICROSOFT_APIS_CALLBACK_URL'),
      scope: scopes,
      passReqToCallback: true,
    });
  }
}
