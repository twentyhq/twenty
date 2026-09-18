import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type CookieOptions, type Request, type Response } from 'express';

import {
  APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME,
  APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME,
} from 'src/engine/core-modules/application/application-registration/constants/application-registration-claim-state-cookie-name.constant';
import { readRequestCookie } from 'src/engine/core-modules/application/application-registration/utils/read-request-cookie.util';
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
export class ApplicationRegistrationClaimStateCookieService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  attachNonceToResponse(
    response: Response,
    nonce: string,
    maxAgeMs: number,
  ): void {
    response.cookie(this.resolveCookieName(), nonce, {
      ...this.resolveCookieOptions(),
      maxAge: maxAgeMs,
    });
  }

  extractNonceFromRequest(request: Request): string | undefined {
    const secureNonce = readRequestCookie(
      request,
      APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME,
    );

    if (isNonEmptyString(secureNonce)) {
      return secureNonce;
    }

    if (this.isSecureDeployment()) {
      return undefined;
    }

    return readRequestCookie(
      request,
      APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME,
    );
  }

  clearNonceCookie(response: Response): void {
    const options = this.resolveCookieOptions();

    response.clearCookie(
      APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME,
      options,
    );
    response.clearCookie(
      APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME,
      options,
    );
  }

  private resolveCookieName(): string {
    return this.isSecureDeployment()
      ? APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME
      : APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME;
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
    return this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE') === 'none'
      ? 'none'
      : 'lax';
  }

  private isSecureDeployment(): boolean {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const sameSite = this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE');

    return isHttpsUrl(serverUrl) || sameSite === 'none';
  }
}
