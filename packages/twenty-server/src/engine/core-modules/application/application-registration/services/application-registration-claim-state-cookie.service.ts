import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type CookieOptions, type Request, type Response } from 'express';

import {
  getApplicationRegistrationClaimStateCookieName,
  getApplicationRegistrationClaimStateSecureCookieName,
} from 'src/engine/core-modules/application/application-registration/constants/application-registration-claim-state-cookie-name.constant';
import { isSecureCookieDeployment } from 'src/engine/core-modules/application/application-registration/utils/is-secure-cookie-deployment.util';
import { readRequestCookie } from 'src/engine/core-modules/application/application-registration/utils/read-request-cookie.util';
import { resolveClaimStateCookieSameSite } from 'src/engine/core-modules/application/application-registration/utils/resolve-claim-state-cookie-same-site.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ApplicationRegistrationClaimStateCookieService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  attachNonceToResponse({
    response,
    applicationRegistrationId,
    nonce,
    maxAgeMs,
  }: {
    response: Response;
    applicationRegistrationId: string;
    nonce: string;
    maxAgeMs: number;
  }): void {
    response.cookie(this.resolveCookieName(applicationRegistrationId), nonce, {
      ...this.resolveCookieOptions(),
      maxAge: maxAgeMs,
    });
  }

  extractNonceFromRequest(
    request: Request,
    applicationRegistrationId: string,
  ): string | undefined {
    const secureNonce = readRequestCookie(
      request,
      getApplicationRegistrationClaimStateSecureCookieName(
        applicationRegistrationId,
      ),
    );

    if (isNonEmptyString(secureNonce)) {
      return secureNonce;
    }

    if (this.isSecureDeployment()) {
      return undefined;
    }

    return readRequestCookie(
      request,
      getApplicationRegistrationClaimStateCookieName(applicationRegistrationId),
    );
  }

  clearNonceCookie(
    response: Response,
    applicationRegistrationId: string,
  ): void {
    const options = this.resolveCookieOptions();

    response.clearCookie(
      getApplicationRegistrationClaimStateSecureCookieName(
        applicationRegistrationId,
      ),
      options,
    );
    response.clearCookie(
      getApplicationRegistrationClaimStateCookieName(applicationRegistrationId),
      options,
    );
  }

  private resolveCookieName(applicationRegistrationId: string): string {
    return this.isSecureDeployment()
      ? getApplicationRegistrationClaimStateSecureCookieName(
          applicationRegistrationId,
        )
      : getApplicationRegistrationClaimStateCookieName(
          applicationRegistrationId,
        );
  }

  private resolveCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isSecureDeployment(),
      sameSite: this.resolveSameSite(),
      path: '/',
    };
  }

  private resolveSameSite(): 'lax' | 'none' {
    return resolveClaimStateCookieSameSite({
      sameSite: this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE'),
    });
  }

  private isSecureDeployment(): boolean {
    return isSecureCookieDeployment({
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      sameSite: this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE'),
    });
  }
}
