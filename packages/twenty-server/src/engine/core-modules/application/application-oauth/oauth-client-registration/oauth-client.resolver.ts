import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Context, Query } from '@nestjs/graphql';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { toClientIdMetadataDocumentRegistrationFields } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/to-client-id-metadata-document-registration-fields.util';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client-registration-resolver.service';
import { isVerifiedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-registration.util';
import { findVerifiedOAuthClientLogoPath } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-logo-path.util';
import { isVerifiedOAuthClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-id-metadata-document-url.util';
import { isVerifiedOAuthClientName } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-name.util';
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

    if (resolvedClient.kind === 'registeredClient') {
      const { registration } = resolvedClient;
      const isVerified = isVerifiedOAuthClientRegistration(registration);

      return {
        id: registration.id,
        name: registration.name,
        logoUrl:
          this.applicationRegistrationAssetUrlService.buildLogoUrl(
            registration,
          ) ??
          (isVerified
            ? findVerifiedOAuthClientLogoPath(registration.universalIdentifier)
            : null),
        websiteUrl: registration.websiteUrl,
        oAuthScopes: registration.oAuthScopes,
        isVerified,
        isClaimingVerifiedClientName:
          !isVerified && isVerifiedOAuthClientName(registration.name),
      };
    }

    const isVerified = isVerifiedOAuthClientIdMetadataDocumentUrl(clientId);
    const { name, logo } = toClientIdMetadataDocumentRegistrationFields(
      resolvedClient.clientIdMetadataDocument,
    );

    return {
      id: resolvedClient.registration?.id ?? v4(),
      name,
      logoUrl: logo,
      websiteUrl: null,
      oAuthScopes: [...ALL_OAUTH_SCOPES],
      isVerified,
      isClaimingVerifiedClientName:
        !isVerified && isVerifiedOAuthClientName(name),
    };
  }
}
