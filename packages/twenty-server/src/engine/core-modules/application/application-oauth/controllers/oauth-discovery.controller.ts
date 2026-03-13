import { Controller, Get, UseGuards } from '@nestjs/common';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';

@Controller('.well-known')
export class OAuthDiscoveryController {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainServerConfigService: DomainServerConfigService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {}

  @Get('oauth-authorization-server')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getAuthorizationServerMetadata() {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const frontendUrl = this.domainServerConfigService.getFrontUrl();

    const cliRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      );

    return {
      issuer: serverUrl,
      authorization_endpoint: `${frontendUrl}authorize`,
      token_endpoint: `${serverUrl}/oauth/token`,
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
      cli_client_id: cliRegistration?.oAuthClientId ?? null,
    };
  }
}
