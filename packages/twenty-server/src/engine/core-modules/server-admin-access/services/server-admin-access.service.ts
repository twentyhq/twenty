import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import { isDefined } from 'twenty-shared/utils';

import { CLOUDFLARE_ACCESS_ASSERTION_HEADER_NAME } from 'src/engine/core-modules/server-admin-access/constants/cloudflare-access-assertion-header-name.constant';
import { verifyCloudflareAccessAssertion } from 'src/engine/core-modules/server-admin-access/utils/verify-cloudflare-access-assertion.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type CloudflareAccessConfiguration = {
  teamDomain: string;
  audience: string;
};

// The edge cannot be trusted to cover every route to the origin (custom hostnames bypass Access),
// so the origin itself checks the admin host and the Access assertion.
@Injectable()
export class ServerAdminAccessService {
  private readonly logger = new Logger(ServerAdminAccessService.name);
  private cloudflareAccessKeySet: JWTVerifyGetKey | undefined;
  private readonly verifiedAccessEmailByRequest = new WeakMap<
    Request,
    Promise<string | undefined>
  >();

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getAdminConsoleUrl(): URL | undefined {
    const adminConsoleUrl = this.twentyConfigService.get('ADMIN_CONSOLE_URL');

    return isNonEmptyString(adminConsoleUrl)
      ? new URL(adminConsoleUrl)
      : undefined;
  }

  isRequestOnAdminConsoleHost(request: Request): boolean {
    const adminConsoleUrl = this.getAdminConsoleUrl();

    return (
      isDefined(adminConsoleUrl) &&
      request.get('host')?.toLowerCase() === adminConsoleUrl.host
    );
  }

  // Pass the authenticated user's email to also bind the Access identity to the Twenty account.
  async isRequestAllowed(
    request: Request,
    userEmail?: string,
  ): Promise<boolean> {
    if (
      isDefined(this.getAdminConsoleUrl()) &&
      !this.isRequestOnAdminConsoleHost(request)
    ) {
      return false;
    }

    const cloudflareAccessConfiguration =
      this.getCloudflareAccessConfiguration();

    if (!isDefined(cloudflareAccessConfiguration)) {
      return true;
    }

    const accessEmail = await this.getVerifiedAccessEmail(
      request,
      cloudflareAccessConfiguration,
    );

    if (!isDefined(accessEmail)) {
      this.logger.warn(
        `Refused server admin request without a valid Cloudflare Access assertion on host ${request.get('host')}`,
      );

      return false;
    }

    if (isDefined(userEmail) && accessEmail !== userEmail.toLowerCase()) {
      this.logger.warn(
        'Refused server admin request whose Cloudflare Access identity does not match the authenticated user',
      );

      return false;
    }

    return true;
  }

  private getCloudflareAccessConfiguration():
    | CloudflareAccessConfiguration
    | undefined {
    const teamDomain = this.twentyConfigService.get(
      'SERVER_ADMIN_CLOUDFLARE_ACCESS_TEAM_DOMAIN',
    );
    const audience = this.twentyConfigService.get(
      'SERVER_ADMIN_CLOUDFLARE_ACCESS_AUDIENCE',
    );

    if (!isNonEmptyString(teamDomain) || !isNonEmptyString(audience)) {
      return undefined;
    }

    return { teamDomain: new URL(teamDomain).origin, audience };
  }

  private getVerifiedAccessEmail(
    request: Request,
    { teamDomain, audience }: CloudflareAccessConfiguration,
  ): Promise<string | undefined> {
    const cachedVerification = this.verifiedAccessEmailByRequest.get(request);

    if (isDefined(cachedVerification)) {
      return cachedVerification;
    }

    const assertionHeader =
      request.headers[CLOUDFLARE_ACCESS_ASSERTION_HEADER_NAME];

    const verification = verifyCloudflareAccessAssertion({
      assertion: Array.isArray(assertionHeader) ? undefined : assertionHeader,
      teamDomain,
      audience,
      keySet: this.getCloudflareAccessKeySet(teamDomain),
    });

    this.verifiedAccessEmailByRequest.set(request, verification);

    return verification;
  }

  private getCloudflareAccessKeySet(teamDomain: string): JWTVerifyGetKey {
    this.cloudflareAccessKeySet ??= createRemoteJWKSet(
      new URL('/cdn-cgi/access/certs', teamDomain),
    );

    return this.cloudflareAccessKeySet;
  }
}
