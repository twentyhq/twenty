import { Injectable } from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { includesExpectedScopes } from 'src/engine/core-modules/auth/services/google-apis-scopes.service.util';
import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

interface TokenInfoResponse {
  scope: string;
  exp: string;
  email: string;
  email_verified: string;
  access_type: string;
  client_id: string;
  user_id: string;
  aud: string;
  azp: string;
  sub: string;
  hd: string;
}

@Injectable()
export class GoogleAPIScopesService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  public async getScopesFromGoogleAccessTokenAndCheckIfExpectedScopesArePresent(
    accessToken: string,
    isDraftEmailEnabled = false,
  ): Promise<{ scopes: string[]; isValid: boolean }> {
    try {
      const httpClient = this.secureHttpClientService.getHttpClient();

      const response = await httpClient.get<TokenInfoResponse>(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`,
        { timeout: 600 },
      );

      const scopes = response.data.scope.split(' ');
      const expectedScopes = getGoogleApisOauthScopes(isDraftEmailEnabled);

      return {
        scopes,
        isValid: includesExpectedScopes(scopes, expectedScopes),
      };
    } catch {
      throw new AuthException(
        'Google account connect error: cannot read scopes from token',
        AuthExceptionCode.INSUFFICIENT_SCOPES,
      );
    }
  }
}
