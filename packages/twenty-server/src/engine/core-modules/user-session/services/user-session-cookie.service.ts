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

  // Whether this deployment can set a Secure cookie at all, which is what
  // decides between the __Host- prefixed name and the plain one.
  private isSecureDeployment(): boolean {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const sameSite = this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE');

    // Parsed rather than prefix-matched: a SERVER_URL spelled HTTPS:// is
    // https, and treating it as plain http would silently hand out a cookie
    // without the __Host- prefix.
    // SameSite=None is rejected by browsers without Secure, so it forces it.
    return isHttpsUrl(serverUrl) || sameSite === 'none';
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
      secureCookieName: USER_SESSION_SECURE_COOKIE_NAME,
      insecureCookieName: USER_SESSION_COOKIE_NAME,
      allowInsecureCookieName: !this.isSecureDeployment(),
    });
  }

  // The impersonator's own session token, parked while they impersonate.
  // Presence alone proves nothing: stopImpersonation re-resolves it and
  // checks it belongs to the impersonator named by the impersonation
  // session, so a tossed cookie cannot restore into someone else's account.
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

  // Deliberately a session cookie with no expires: without cookie sessions the
  // impersonator's credential is parked in sessionStorage, which dies with the
  // tab, and outliving the browser would keep the restore path open longer
  // than the mechanism it replaces.
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

  // Looser than extractSessionTokenFromRequest on purpose: it answers "did the
  // browser send us one of our cookies", including the legacy plain name an
  // https deployment refuses to authenticate with but should still clear.
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

    // Both names are cleared so an instance that switched from http to https
    // drops the cookie it issued under the old name. On a plain-http instance
    // the __Host- clear is inert, but so is the cookie: __Host- requires
    // Secure and is never sent over http.
    response.clearCookie(USER_SESSION_SECURE_COOKIE_NAME, options);
    response.clearCookie(USER_SESSION_COOKIE_NAME, options);
  }
}
