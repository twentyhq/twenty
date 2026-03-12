import { Controller, Get, UseGuards } from '@nestjs/common';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('.well-known')
export class OAuthDiscoveryController {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  @Get('oauth-authorization-server')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  getAuthorizationServerMetadata() {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return {
      issuer: serverUrl,
      authorization_endpoint: `${serverUrl}/authorize`,
      token_endpoint: `${serverUrl}/oauth/token`,
      registration_endpoint: `${serverUrl}/oauth/register`,
      revocation_endpoint: `${serverUrl}/oauth/revoke`,
      introspection_endpoint: `${serverUrl}/oauth/introspect`,
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
    };
  }

  // RFC 9728: OAuth 2.0 Protected Resource Metadata
  @Get('oauth-protected-resource')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  getProtectedResourceMetadata() {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return {
      resource: `${serverUrl}/mcp`,
      authorization_servers: [serverUrl],
      scopes_supported: ALL_OAUTH_SCOPES,
      bearer_methods_supported: ['header'],
    };
  }
}
