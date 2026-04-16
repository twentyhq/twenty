import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { type Request } from 'express';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

@Controller('.well-known')
export class OAuthDiscoveryController {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {}

  @Get('oauth-authorization-server')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getAuthorizationServerMetadata(@Req() request: Request) {
    const issuer = this.getRequestBaseUrl(request);

    const cliRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      );

    return {
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
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

  // RFC 9728: `resource` is echoed back as the host the client connected to
  // so that MCP clients can validate the resource indicator they were trying
  // to reach. Without this, pasting any URL other than SERVER_URL/mcp breaks
  // discovery.
  @Get('oauth-protected-resource')
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
}
