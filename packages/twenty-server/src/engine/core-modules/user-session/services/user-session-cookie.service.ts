import { Injectable } from '@nestjs/common';

import { type CookieOptions, type Request, type Response } from 'express';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';
import { extractUserSessionTokenFromRequestCookie } from 'src/engine/core-modules/user-session/utils/extract-user-session-token-from-request.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class UserSessionCookieService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  // Whether this deployment can set a Secure cookie at all, which is what
  // decides between the __Host- prefixed name and the plain one.
  private isSecureDeployment(): boolean {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const sameSite = this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE');

    // SameSite=None is rejected by browsers without Secure, so it forces it.
    return (
      Boolean(serverUrl && serverUrl.startsWith('https')) || sameSite === 'none'
    );
  }

  // The kill switch lives here rather than at each call site: with it off,
  // no cookie is read, written or cleared anywhere, and retiring the flag at
  // cutover is one deletion instead of an audit of every consumer.
  private areCookieSessionsEnabled(): boolean {
    return this.twentyConfigService.get('AUTH_COOKIE_SESSIONS_ENABLED');
  }

  // An https deployment never reads the plain cookie name, so an instance
  // that enables TLS signs its users out once: the browsers still holding the
  // old plain-named cookie get a fresh __Host- one on their next sign-in.
  // That re-login is the deliberate price of the __Host- prefix, which is what
  // stops a sibling subdomain from tossing a Domain-widened session cookie.
  extractSessionTokenFromRequest(request: Request): string | undefined {
    if (!this.areCookieSessionsEnabled()) {
      return undefined;
    }

    return extractUserSessionTokenFromRequestCookie(request, {
      allowInsecureCookieName: !this.isSecureDeployment(),
    });
  }

  private resolveCookieSettings(): {
    cookieName: string;
    options: CookieOptions;
  } {
    const sameSite = this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE');
    const secure = this.isSecureDeployment();

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
    if (!this.areCookieSessionsEnabled()) {
      return;
    }

    const { cookieName, options } = this.resolveCookieSettings();

    response.cookie(cookieName, sessionToken, {
      ...options,
      expires: expiresAt,
    });
  }

  clearSessionCookie(response: Response): void {
    const { options } = this.resolveCookieSettings();

    // Both names are cleared so an instance that switched from http to https
    // drops the cookie it issued under the old name. On a plain-http instance
    // the __Host- clear is inert, but so is the cookie: __Host- requires
    // Secure and is never sent over http.
    response.clearCookie(USER_SESSION_SECURE_COOKIE_NAME, options);
    response.clearCookie(USER_SESSION_COOKIE_NAME, options);
  }
}
