import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

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
  constructor(private httpService: HttpService) {}

  public async getGoogleScopes(accessToken: string): Promise<string[]> {
    try {
      const response = await this.httpService.axiosRef.get<TokenInfoResponse>(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`,
        { timeout: 600 },
      );

      return response.data.scope.split(' ');
    } catch (error) {
      throw new AuthException(
        'Google account connect error: cannot read scopes from token',
        AuthExceptionCode.INSUFFICIENT_SCOPES,
      );
    }
  }

  public includesExpectedScopes(scopes: string[], expectedScopes: string[]) {
    return expectedScopes.every(
      (expectedScope) =>
        scopes.includes(expectedScope) ||
        scopes.includes(
          `https://www.googleapis.com/auth/userinfo.${expectedScope}`,
        ),
    );
  }
}
