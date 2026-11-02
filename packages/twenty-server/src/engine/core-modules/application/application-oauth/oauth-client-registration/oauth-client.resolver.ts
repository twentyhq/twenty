import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Context, Query } from '@nestjs/graphql';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import {
  CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX,
  CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-fetch-rate-limit.constant';
import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';
import { toClientIdMetadataDocumentRegistrationFields } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/to-client-id-metadata-document-registration-fields.util';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client-registration-resolver.service';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application/application-registration/dtos/public-application-registration.dto';
import { getWellKnownOAuthClientOfRegistration } from 'src/engine/core-modules/application/well-known-oauth-client/utils/get-well-known-oauth-client-of-registration.util';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
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
    private readonly clientIdMetadataDocumentService: ClientIdMetadataDocumentService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Query(() => PublicApplicationRegistrationDTO, { nullable: true })
  async findApplicationRegistrationByClientId(
    @Args('clientId') clientId: string,
    @Context() context: { req: Request },
  ): Promise<PublicApplicationRegistrationDTO | null> {
    await this.throttleClientIdMetadataDocumentFetchOrThrow({
      clientId,
      requestIp: context.req.ip,
    });

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
          getWellKnownOAuthClientOfRegistration(registration),
      };
    }

    if (!isDefined(clientIdMetadataDocument)) {
      return null;
    }

    const { name, logo } = toClientIdMetadataDocumentRegistrationFields(
      clientIdMetadataDocument,
    );

    // Not registered until a user authorizes it, so this id names no stored row
    return {
      id: v4(),
      name,
      logoUrl: logo,
      websiteUrl: null,
      oAuthScopes: [...ALL_OAUTH_SCOPES],
      wellKnownOAuthClient: null,
    };
  }

  // Anyone can make the server fetch a URL and cache its document, so uncached URLs are rationed per IP
  private async throttleClientIdMetadataDocumentFetchOrThrow({
    clientId,
    requestIp,
  }: {
    clientId: string;
    requestIp: string | undefined;
  }): Promise<void> {
    if (
      !isClientIdMetadataDocumentUrl(clientId) ||
      !(await this.clientIdMetadataDocumentService.isFetchDue(clientId))
    ) {
      return;
    }

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `oauth-client-metadata-document-fetch:${requestIp}`,
      1,
      CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX,
      CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_WINDOW_MS,
    );
  }
}
