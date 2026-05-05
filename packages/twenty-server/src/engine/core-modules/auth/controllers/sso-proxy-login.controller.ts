import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  Logger,
  NotFoundException,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import ms from 'ms';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { SsoUserProvisioningService } from 'src/engine/core-modules/auth/services/sso-user-provisioning.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const TOKEN_PAIR_COOKIE_NAME = 'tokenPair';

@Controller('auth/sso')
@UseFilters(AuthRestApiExceptionFilter)
export class SsoProxyLoginController {
  private readonly logger = new Logger(SsoProxyLoginController.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly ssoUserProvisioningService: SsoUserProvisioningService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  // SECURITY — the trust chain for X-Auth-Request-Email / X-Auth-Request-User:
  //   1. The Twenty container exposes :3000 only on the docker network — it
  //      is not published to the host. Only Traefik can reach it from
  //      outside the cluster.
  //   2. Traefik's `twenty-secure` router applies the `strip-auth-headers`
  //      middleware BEFORE `mpass-auth`. Inbound `X-Auth-Request-*` headers
  //      from a browser are deleted at the edge.
  //   3. `mpass-auth` (oauth2-proxy ForwardAuth) re-injects the headers
  //      from the validated SSO session.
  // Removing any link of this chain — exposing :3000, dropping
  // `strip-auth-headers`, or reordering the middleware — makes this endpoint
  // an authentication-bypass primitive. Every change to the Traefik labels
  // for `twenty-secure` MUST preserve this ordering. See
  // foss-server-bundle-devstack/docs/app-rules.md.
  @Get('proxy-login')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async proxyLogin(
    @Headers('x-auth-request-email') headerEmail: string | string[] | undefined,
    @Headers('x-auth-request-user') headerUser: string | string[] | undefined,
    @Res() res: Response,
  ) {
    if (this.twentyConfigService.get('AUTH_TYPE') !== 'SSO') {
      throw new NotFoundException();
    }

    const email = this.resolveEmail(headerEmail, headerUser);

    if (!email) {
      // Opaque 404 — same response shape as the AUTH_TYPE!==SSO branch.
      // A diagnostic 401 would tell an internal-network attacker they hit
      // a real SSO endpoint and just need to forge a header next.
      this.logger.warn(
        'SSO proxy-login called without X-Auth-Request-Email or X-Auth-Request-User headers.',
      );
      throw new NotFoundException();
    }

    const { user, workspace } =
      await this.ssoUserProvisioningService.findOrProvision(email);

    const accessToken = await this.accessTokenService.generateAccessToken({
      userId: user.id,
      workspaceId: workspace.id,
      authProvider: AuthProviderEnum.SSO,
    });

    const refreshToken = await this.refreshTokenService.generateRefreshToken({
      userId: user.id,
      workspaceId: workspace.id,
      authProvider: AuthProviderEnum.SSO,
      targetedTokenType: JwtTokenTypeEnum.ACCESS,
    });

    this.setTokenPairCookie(res, {
      accessOrWorkspaceAgnosticToken: {
        token: accessToken.token,
        expiresAt: accessToken.expiresAt.toISOString(),
      },
      refreshToken: {
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt.toISOString(),
      },
    });

    return res.redirect(HttpStatus.FOUND, '/');
  }

  private resolveEmail(
    rawEmail: string | string[] | undefined,
    rawUser: string | string[] | undefined,
  ): string | null {
    const headerEmail = this.firstHeaderValue(rawEmail);
    const headerUser = this.firstHeaderValue(rawUser);
    const candidate = (headerEmail || headerUser || '').trim();

    if (!candidate) {
      return null;
    }

    if (candidate.includes('@')) {
      return candidate.toLowerCase();
    }

    const domain = this.twentyConfigService.get('DEFAULT_EMAIL_DOMAIN');

    if (!domain) {
      this.logger.warn(
        'X-Auth-Request-User contains a bare username but DEFAULT_EMAIL_DOMAIN is not configured.',
      );

      return null;
    }

    return `${candidate.toLowerCase()}@${domain}`;
  }

  private firstHeaderValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }

    return value ?? '';
  }

  private setTokenPairCookie(
    res: Response,
    payload: {
      accessOrWorkspaceAgnosticToken: { token: string; expiresAt: string };
      refreshToken: { token: string; expiresAt: string };
    },
  ) {
    // Cookie lifetime tracks the refresh token, not the access token.
    // The cookie carries both: if it expired with the access token, the
    // browser would drop the refresh token alongside and force a full
    // re-auth instead of a silent refresh.
    const refreshExpiry = this.twentyConfigService.get(
      'REFRESH_TOKEN_EXPIRES_IN',
    );
    const maxAgeMs = ms(refreshExpiry);

    // Match the rest of Twenty's cookie config (e.g. session): only set
    // the Secure flag when SERVER_URL itself is https. Hardcoding `true`
    // would block local http:// dev setups from storing the cookie.
    const serverUrl = this.twentyConfigService.get('SERVER_URL') ?? '';
    const isSecure = serverUrl.startsWith('https');

    res.cookie(TOKEN_PAIR_COOKIE_NAME, JSON.stringify(payload), {
      path: '/',
      sameSite: 'lax',
      secure: isSecure,
      httpOnly: false,
      maxAge: maxAgeMs,
    });
  }
}
