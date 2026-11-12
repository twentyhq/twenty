import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type CookieOptions, type Request, type Response } from 'express';

import {
  CONNECTION_PROVIDER_FLOW_COOKIE_NAME,
  CONNECTION_PROVIDER_FLOW_SECURE_COOKIE_NAME,
} from 'src/engine/core-modules/application/connection-provider/constants/connection-provider-flow-cookie-name.constant';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isSecureCookieDeployment } from 'src/engine/core-modules/user-session/utils/is-secure-cookie-deployment.util';
import { readCookieValue } from 'src/engine/core-modules/user-session/utils/read-cookie-value.util';

const FLOW_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

// Binds an OAuth sign-in to the browser that started it: the callback only completes with this cookie.
@Injectable()
export class ConnectionProviderFlowCookieService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  attachBrowserNonce(response: Response, browserNonce: string): void {
    response.cookie(this.resolveCookieName(), browserNonce, {
      ...this.resolveCookieOptions(),
      maxAge: FLOW_COOKIE_MAX_AGE_MS,
    });
  }

  readBrowserNonce(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;

    return isNonEmptyString(cookieHeader)
      ? readCookieValue(cookieHeader, this.resolveCookieName())
      : undefined;
  }

  clearBrowserNonce(response: Response): void {
    response.clearCookie(this.resolveCookieName(), this.resolveCookieOptions());
  }

  private isSecureDeployment(): boolean {
    return isSecureCookieDeployment({
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      sameSite: this.twentyConfigService.get('AUTH_COOKIE_SAME_SITE'),
    });
  }

  private resolveCookieName(): string {
    return this.isSecureDeployment()
      ? CONNECTION_PROVIDER_FLOW_SECURE_COOKIE_NAME
      : CONNECTION_PROVIDER_FLOW_COOKIE_NAME;
  }

  private resolveCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isSecureDeployment(),
      sameSite: 'lax',
      path: '/',
    };
  }
}
