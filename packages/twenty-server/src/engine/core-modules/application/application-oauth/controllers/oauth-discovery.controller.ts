import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { type Request } from 'express';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { cleanServerUrl } from 'src/utils/clean-server-url';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

@Controller('.well-known')
export class OAuthDiscoveryController {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainServerConfigService: DomainServerConfigService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {}

  @Get('oauth-authorization-server')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getAuthorizationServerMetadata(@Req() request: Request) {
    const issuer = this.getRequestBaseUrl(request);
    // /authorize is served by the frontend; SERVER_URL (API-only) has no such
    // route, so we route the client to the default frontend base URL in that
    // case. All other hosts (app.twenty.com, workspace subdomains, custom
    // domains) serve both frontend and API.
    const authorizeBase = this.isApiHost(request)
      ? cleanServerUrl(this.domainServerConfigService.getBaseUrl().toString())
      : issuer;

    const cliRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      );

    return {
      issuer,
      authorization_endpoint: `${authorizeBase}/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      registration_endpoint: `${issuer}/oauth/register`,
      revocation_endpoint: `${issuer}/oauth/revoke`,
      introspection_endpoint: `${issuer}/oauth/introspect`,
      scopes_supported: ALL_OAUTH_SCOPES,
      response_types_supported: ['code'],
      grant_types_supported: [
        'authorization_code',
        'client_credentials',
        'refresh_token',
      ],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
      revocation_endpoint_auth_methods_supported: ['client_secret_post'],
      introspection_endpoint_auth_methods_supported: ['client_secret_post'],
      ...(cliRegistration
        ? { cli_client_id: cliRegistration.oAuthClientId }
        : {}),
    };
  }

  // RFC 9728: OAuth 2.0 Protected Resource Metadata.
  // Exposed at both the root and the resource-specific path (/mcp) because
  // RFC 9728 defines the path-aware form and clients may probe either.
  // The `resource` value echoes the host the request reached so the metadata
  // matches the resource indicator the client used.
  @Get(['oauth-protected-resource', 'oauth-protected-resource/mcp'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  getProtectedResourceMetadata(@Req() request: Request) {
    const base = this.getRequestBaseUrl(request);

    return {
      resource: `${base}/mcp`,
      authorization_servers: [base],
      scopes_supported: ALL_OAUTH_SCOPES,
      bearer_methods_supported: ['header'],
    };
  }

  private getRequestBaseUrl(request: Request): string {
    return `${request.protocol}://${request.get('host')}`;
  }

  private isApiHost(request: Request): boolean {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return request.get('host') === new URL(serverUrl).host;
  }
}
