import { Injectable } from '@nestjs/common';

import { type CookieOptions, type Response } from 'express';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class UserSessionCookieService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  private resolveCookieSettings(): {
    cookieName: string;
    options: CookieOptions;
  } {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const sameSite = this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE');

    // SameSite=None is rejected by browsers without Secure, so it forces it.
    const secure =
      Boolean(serverUrl && serverUrl.startsWith('https')) ||
      sameSite === 'none';

    return {
      cookieName: secure
        ? USER_SESSION_SECURE_COOKIE_NAME
        : USER_SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        secure,
        sameSite,
        path: '/',
      },
    };
  }

  attachSessionTokenToResponse(
    response: Response,
    sessionToken: string,
    expiresAt: Date,
  ): void {
    const { cookieName, options } = this.resolveCookieSettings();

    response.cookie(cookieName, sessionToken, {
      ...options,
      expires: expiresAt,
    });
  }

  clearSessionCookie(response: Response): void {
    const { options } = this.resolveCookieSettings();

    // Both names are cleared so sign-out works across http/https transitions.
    response.clearCookie(USER_SESSION_SECURE_COOKIE_NAME, options);
    response.clearCookie(USER_SESSION_COOKIE_NAME, options);
  }
}
