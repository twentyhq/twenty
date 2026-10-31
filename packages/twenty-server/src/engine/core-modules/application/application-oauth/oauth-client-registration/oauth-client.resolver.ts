import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { toClientIdMetadataDocumentRegistrationFields } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/to-client-id-metadata-document-registration-fields.util';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client-registration-resolver.service';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/public-application-registration.dto';
import { getWellKnownOAuthClientOfRegistration } from 'src/engine/core-modules/application/well-known-oauth-client/utils/get-well-known-oauth-client-of-registration.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@UseFilters(ApplicationRegistrationExceptionFilter)
@MetadataResolver()
export class OAuthClientResolver {
  constructor(
    private readonly oAuthClientRegistrationResolverService: OAuthClientRegistrationResolverService,
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
  ) {}

  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Query(() => PublicApplicationRegistrationDTO, { nullable: true })
  async findApplicationRegistrationByClientId(
    @Args('clientId') clientId: string,
  ): Promise<PublicApplicationRegistrationDTO | null> {
    const resolvedClient =
      await this.oAuthClientRegistrationResolverService.resolveClient(clientId);

    if (!isDefined(resolvedClient)) {
      return null;
    }

    const { registration, clientIdMetadataDocument } = resolvedClient;

    if (isDefined(registration)) {
      return {
        id: registration.id,
        name: registration.name,
        logoUrl:
          this.applicationRegistrationAssetUrlService.buildLogoUrl(
            registration,
          ),
        websiteUrl: registration.websiteUrl,
        oAuthScopes: registration.oAuthScopes,
        wellKnownOAuthClient:
          getWellKnownOAuthClientOfRegistration(registration)?.client ?? null,
      };
    }

    if (!isDefined(clientIdMetadataDocument)) {
      return null;
    }

    const { id, name, logo } = toClientIdMetadataDocumentRegistrationFields(
      clientIdMetadataDocument,
    );

    return {
      id,
      name,
      logoUrl: logo,
      websiteUrl: null,
      oAuthScopes: [...ALL_OAUTH_SCOPES],
      wellKnownOAuthClient: null,
    };
  }
}
