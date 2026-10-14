import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { isUserSessionToken } from 'src/engine/core-modules/user-session/utils/is-user-session-token.util';

const MAX_AUTHORIZATION_TOKEN_CANDIDATES = 3;

@Injectable()
export class ServerRouteAuthorizationHeaderService {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async isForwardable(
    authorizationHeaderValue: string | undefined,
  ): Promise<boolean> {
    if (!isNonEmptyString(authorizationHeaderValue)) {
      return true;
    }

    const tokenCandidates = authorizationHeaderValue
      .split(/[\s,]+/)
      .filter(isNonEmptyString);

    if (tokenCandidates.length > MAX_AUTHORIZATION_TOKEN_CANDIDATES) {
      return false;
    }

    for (const tokenCandidate of tokenCandidates) {
      if (await this.isTwentyCredential(tokenCandidate)) {
        return false;
      }
    }

    return true;
  }

  private async isTwentyCredential(token: string): Promise<boolean> {
    if (isUserSessionToken(token)) {
      return true;
    }

    try {
      await this.jwtWrapperService.verifyJwtToken(token, {
        ignoreExpiration: true,
      });

      return true;
    } catch (error) {
      return !(error instanceof AuthException);
    }
  }
}
