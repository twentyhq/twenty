import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { type CookieOptions, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_IMPERSONATOR_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-impersonator-cookie-name.constant';
import { USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-impersonator-secure-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';
import { extractUserSessionTokenFromRequestCookie } from 'src/engine/core-modules/user-session/utils/extract-user-session-token-from-request.util';
import { resolveSessionCookieAccess } from 'src/engine/core-modules/user-session/utils/resolve-session-cookie-access.util';
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

// Every read and write of the session cookies goes through here, gated by resolveSessionCookieAccess.
@Injectable()
export class UserSessionCookieService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  private isSecureDeployment(): boolean {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const sameSite = this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE');

    // SameSite=None is rejected by browsers without Secure, so it forces it.
    return isHttpsUrl(serverUrl) || sameSite === 'none';
  }

  private isSessionCookieAccessAllowed(request: Request | undefined): boolean {
    return (
      isDefined(request) && resolveSessionCookieAccess(request) !== 'denied'
    );
  }

  private extractAllowedSessionToken(
    request: Request,
    cookieNames: { secureCookieName: string; insecureCookieName: string },
  ): string | undefined {
    const access = resolveSessionCookieAccess(request);

    if (access === 'denied') {
      return undefined;
    }

    const sessionToken = extractUserSessionTokenFromRequestCookie(request, {
      ...cookieNames,
      allowInsecureCookieName: !this.isSecureDeployment(),
    });

    if (access === 'legacy' && isDefined(sessionToken)) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.UserSessionCookieLegacyAccess,
        amount: 1,
      });
    }

    return sessionToken;
  }

  extractSessionTokenFromRequest(request: Request): string | undefined {
    return this.extractAllowedSessionToken(request, {
      secureCookieName: USER_SESSION_SECURE_COOKIE_NAME,
      insecureCookieName: USER_SESSION_COOKIE_NAME,
    });
  }

  extractImpersonatorSessionTokenFromRequest(
    request: Request,
  ): string | undefined {
    return this.extractAllowedSessionToken(request, {
      secureCookieName: USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME,
      insecureCookieName: USER_SESSION_IMPERSONATOR_COOKIE_NAME,
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
    if (!this.isSessionCookieAccessAllowed(response.req)) {
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
    if (!this.isSessionCookieAccessAllowed(response.req)) {
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
    if (!this.isSessionCookieAccessAllowed(response.req)) {
      return;
    }

    const options = this.resolveCookieOptions();

    response.clearCookie(USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME, options);
    response.clearCookie(USER_SESSION_IMPERSONATOR_COOKIE_NAME, options);
  }

  hasSessionCookie(request: Request): boolean {
    const cookieHeader = request.headers.cookie;

    if (
      !isNonEmptyString(cookieHeader) ||
      !this.isSessionCookieAccessAllowed(request)
    ) {
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
    if (!this.isSessionCookieAccessAllowed(response.req)) {
      return;
    }

    const { options } = this.resolveCookieSettings();

    // Both names, so an instance that switched to https drops the cookie issued under the old one.
    response.clearCookie(USER_SESSION_SECURE_COOKIE_NAME, options);
    response.clearCookie(USER_SESSION_COOKIE_NAME, options);
  }
}
