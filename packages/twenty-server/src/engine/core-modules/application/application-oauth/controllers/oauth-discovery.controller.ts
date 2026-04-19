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
      response_modes_supported: ['query'],
      grant_types_supported: [
        'authorization_code',
        'client_credentials',
        'refresh_token',
      ],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
      revocation_endpoint_auth_methods_supported: ['client_secret_post'],
      introspection_endpoint_auth_methods_supported: ['client_secret_post'],
      // RFC 9207: advertise `iss` in authorization responses to defend against
      // OAuth mix-up attacks. Required by OAuth 2.1 security BCP.
      authorization_response_iss_parameter_supported: true,
      ...(cliRegistration
        ? { cli_client_id: cliRegistration.oAuthClientId }
        : {}),
    };
  }

  // RFC 9728 §3.2: the `resource` value MUST equal the resource identifier
  // into which the well-known path suffix was inserted. So the root form maps
  // to the origin as-a-resource, and the /mcp-suffixed form maps to
  // <origin>/mcp. Strict clients probing the path-aware variant will reject
  // mismatching metadata.

  @Get('oauth-protected-resource')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  getProtectedResourceMetadataRoot(@Req() request: Request) {
    const base = this.getRequestBaseUrl(request);

    return this.buildProtectedResourceMetadata(base, base);
  }

  @Get('oauth-protected-resource/mcp')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  getProtectedResourceMetadataMcp(@Req() request: Request) {
    const base = this.getRequestBaseUrl(request);

    return this.buildProtectedResourceMetadata(base, `${base}/mcp`);
  }

  private buildProtectedResourceMetadata(base: string, resource: string) {
    return {
      resource,
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
