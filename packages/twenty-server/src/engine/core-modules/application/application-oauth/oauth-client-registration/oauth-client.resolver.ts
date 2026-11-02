import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Context, Query } from '@nestjs/graphql';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { toClientIdMetadataDocumentRegistrationFields } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/to-client-id-metadata-document-registration-fields.util';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client-registration-resolver.service';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/public-application-registration.dto';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@UseFilters(
  ApplicationRegistrationExceptionFilter,
  ThrottlerGraphqlApiExceptionFilter,
)
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
    @Context() context: { req: Request },
  ): Promise<PublicApplicationRegistrationDTO | null> {
    await this.oAuthClientRegistrationResolverService.throttleClientIdMetadataDocumentFetchOrThrow(
      { clientId, requestIp: context.req.ip },
    );

    const resolvedClient =
      await this.oAuthClientRegistrationResolverService.resolveClient(clientId);

    if (!isDefined(resolvedClient)) {
      return null;
    }

    // The stored name and logo only follow the document once a user authorizes, so consent shows the fetched ones
    if (resolvedClient.kind === 'clientIdMetadataDocument') {
      const { registration, clientIdMetadataDocument } = resolvedClient;
      const { name, logo } = toClientIdMetadataDocumentRegistrationFields(
        clientIdMetadataDocument,
      );

      return {
        id: registration?.id ?? v4(),
        name,
        logoUrl: logo,
        websiteUrl: registration?.websiteUrl ?? null,
        oAuthScopes: registration?.oAuthScopes ?? [...ALL_OAUTH_SCOPES],
      };
    }

    const { registration } = resolvedClient;

    return {
      id: registration.id,
      name: registration.name,
      logoUrl:
        this.applicationRegistrationAssetUrlService.buildLogoUrl(registration),
      websiteUrl: registration.websiteUrl,
      oAuthScopes: registration.oAuthScopes,
    };
  }
}
