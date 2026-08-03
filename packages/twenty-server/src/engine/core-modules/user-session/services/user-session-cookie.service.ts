import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { type CookieOptions, type Request, type Response } from 'express';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_IMPERSONATOR_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-impersonator-cookie-name.constant';
import { USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-impersonator-secure-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';
import { extractUserSessionTokenFromRequestCookie } from 'src/engine/core-modules/user-session/utils/extract-user-session-token-from-request.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const isHttpsUrl = (url: string | undefined): boolean => {
  if (!isNonEmptyString(url)) {
    return false;
  }

  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

@Injectable()
export class UserSessionCookieService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  private isSecureDeployment(): boolean {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const sameSite = this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE');

    // SameSite=None is rejected by browsers without Secure, so it forces it.
    return isHttpsUrl(serverUrl) || sameSite === 'none';
  }

  private areCookieSessionsEnabled(): boolean {
    return this.twentyConfigService.get('AUTH_COOKIE_SESSIONS_ENABLED');
  }

  extractSessionTokenFromRequest(request: Request): string | undefined {
    if (!this.areCookieSessionsEnabled()) {
      return undefined;
    }

    return extractUserSessionTokenFromRequestCookie(request, {
      secureCookieName: USER_SESSION_SECURE_COOKIE_NAME,
      insecureCookieName: USER_SESSION_COOKIE_NAME,
      allowInsecureCookieName: !this.isSecureDeployment(),
    });
  }

  extractImpersonatorSessionTokenFromRequest(
    request: Request,
  ): string | undefined {
    if (!this.areCookieSessionsEnabled()) {
      return undefined;
    }

    return extractUserSessionTokenFromRequestCookie(request, {
      secureCookieName: USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME,
      insecureCookieName: USER_SESSION_IMPERSONATOR_COOKIE_NAME,
      allowInsecureCookieName: !this.isSecureDeployment(),
    });
  }

  private resolveCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isSecureDeployment(),
      sameSite: this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE'),
      path: '/',
    };
  }

  private resolveCookieSettings(): {
    cookieName: string;
    options: CookieOptions;
  } {
    return {
      cookieName: this.isSecureDeployment()
        ? USER_SESSION_SECURE_COOKIE_NAME
        : USER_SESSION_COOKIE_NAME,
      options: this.resolveCookieOptions(),
    };
  }

  attachSessionTokenToResponse(
    response: Response,
    sessionToken: string,
    expiresAt: Date,
  ): void {
    if (!this.areCookieSessionsEnabled()) {
      return;
    }

    const { cookieName, options } = this.resolveCookieSettings();

    response.cookie(cookieName, sessionToken, {
      ...options,
      expires: expiresAt,
    });
  }

  attachImpersonatorSessionTokenToResponse(
    response: Response,
    sessionToken: string,
  ): void {
    if (!this.areCookieSessionsEnabled()) {
      return;
    }

    response.cookie(
      this.isSecureDeployment()
        ? USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME
        : USER_SESSION_IMPERSONATOR_COOKIE_NAME,
      sessionToken,
      this.resolveCookieOptions(),
    );
  }

  clearImpersonatorSessionCookie(response: Response): void {
    if (!this.areCookieSessionsEnabled()) {
      return;
    }

    const options = this.resolveCookieOptions();

    response.clearCookie(USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME, options);
    response.clearCookie(USER_SESSION_IMPERSONATOR_COOKIE_NAME, options);
  }

  hasSessionCookie(request: Request): boolean {
    if (!this.areCookieSessionsEnabled()) {
      return false;
    }

    const cookieHeader = request.headers.cookie;

    if (!isNonEmptyString(cookieHeader)) {
      return false;
    }

    return [USER_SESSION_SECURE_COOKIE_NAME, USER_SESSION_COOKIE_NAME].some(
      (cookieName) =>
        cookieHeader
          .split(';')
          .some((cookiePart) => cookiePart.trim().startsWith(`${cookieName}=`)),
    );
  }

  clearSessionCookie(response: Response): void {
    if (!this.areCookieSessionsEnabled()) {
      return;
    }

    const { options } = this.resolveCookieSettings();

    // Both names, so an instance that switched to https drops the cookie it
    // issued under the old one.
    response.clearCookie(USER_SESSION_SECURE_COOKIE_NAME, options);
    response.clearCookie(USER_SESSION_COOKIE_NAME, options);
  }
}
