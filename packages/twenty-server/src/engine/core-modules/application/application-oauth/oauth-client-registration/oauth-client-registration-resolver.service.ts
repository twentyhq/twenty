import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX,
  CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-fetch-rate-limit.constant';
import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/resolved-oauth-client.type';
import { toClientIdMetadataDocumentRegistrationFields } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/to-client-id-metadata-document-registration-fields.util';
import { PUBLIC_OAUTH_CLIENT_REGISTRATION_VALUES } from 'src/engine/core-modules/application/application-oauth/constants/public-oauth-client-registration-values.constant';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { findMarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-connect-listing.util';
import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';
import { findVerifiedOAuthClientForClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-for-client-id-metadata-document-url.util';
import { isVerifiedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-registration.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

@Injectable()
export class OAuthClientRegistrationResolverService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly clientIdMetadataDocumentService: ClientIdMetadataDocumentService,
    private readonly throttlerService: ThrottlerService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {}

  async throttleClientIdMetadataDocumentFetchOrThrow({
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
      `oauth-client-metadata-document-fetch:${requestIp ?? 'unknown-ip'}`,
      1,
      CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX,
      CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_WINDOW_MS,
    );
  }

  async findByClientId(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return (await this.resolveClient(clientId))?.registration ?? null;
  }

  async resolveClient(clientId: string): Promise<ResolvedOAuthClient | null> {
    if (!isClientIdMetadataDocumentUrl(clientId)) {
      const registration = await this.findRegistrationByOAuthClientId(clientId);

      return isDefined(registration)
        ? {
            kind: 'registeredClient',
            registration,
            clientIdMetadataDocument: null,
          }
        : null;
    }

    const clientIdMetadataDocument =
      await this.clientIdMetadataDocumentService.findDocument(clientId);

    if (!isDefined(clientIdMetadataDocument)) {
      return null;
    }

    return {
      kind: 'clientIdMetadataDocument',
      registration: await this.findRegistrationByOAuthClientId(clientId),
      clientIdMetadataDocument,
    };
  }

  // Also for revocation, which must not depend on the client's document still being reachable
  async findRegistrationByOAuthClientId(
    oAuthClientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId },
    });

    if (isDefined(registration)) {
      return registration;
    }

    const verifiedClient =
      findVerifiedOAuthClientForClientIdMetadataDocumentUrl(oAuthClientId);

    if (!isDefined(verifiedClient)) {
      return null;
    }

    const verifiedClientRegistration =
      await this.applicationRegistrationRepository.findOne({
        where: { universalIdentifier: verifiedClient.universalIdentifier },
      });

    return isDefined(verifiedClientRegistration) &&
      isVerifiedOAuthClientRegistration(verifiedClientRegistration)
      ? verifiedClientRegistration
      : null;
  }

  // Only for a signed-in user's authorization: the public token and consent endpoints would store a row for any hosted URL
  async registerClientIdMetadataDocumentClient({
    clientIdMetadataDocument,
    registration: existingRegistration,
  }: Pick<
    Extract<ResolvedOAuthClient, { kind: 'clientIdMetadataDocument' }>,
    'clientIdMetadataDocument' | 'registration'
  >): Promise<void> {
    const verifiedClient =
      findVerifiedOAuthClientForClientIdMetadataDocumentUrl(
        clientIdMetadataDocument.clientId,
      );

    if (isDefined(verifiedClient) && !isDefined(existingRegistration)) {
      await this.findOrCreateVerifiedClientRegistrationOrThrow(verifiedClient);

      return;
    }

    // Shared by every document of its store card, so no single document describes it
    if (
      isDefined(existingRegistration) &&
      isVerifiedOAuthClientRegistration(existingRegistration)
    ) {
      return;
    }

    const documentFields = toClientIdMetadataDocumentRegistrationFields(
      clientIdMetadataDocument,
    );

    if (isDefined(existingRegistration)) {
      const hasDocumentChanged =
        existingRegistration.name !== documentFields.name ||
        existingRegistration.logo !== documentFields.logo ||
        !isEqual(
          existingRegistration.oAuthRedirectUris,
          documentFields.oAuthRedirectUris,
        );

      if (hasDocumentChanged) {
        await this.applicationRegistrationRepository.update(
          existingRegistration.id,
          documentFields,
        );
      }

      return;
    }

    await this.applicationRegistrationRepository
      .createQueryBuilder()
      .insert()
      .into(ApplicationRegistrationEntity)
      .values({
        ...documentFields,
        universalIdentifier: v4(),
        ...PUBLIC_OAUTH_CLIENT_REGISTRATION_VALUES,
        oAuthClientId: clientIdMetadataDocument.clientId,
        oAuthScopes: [...ALL_OAUTH_SCOPES],
      })
      .orIgnore()
      .execute();
  }

  private async findOrCreateVerifiedClientRegistrationOrThrow({
    universalIdentifier,
  }: Pick<VerifiedOAuthClient, 'universalIdentifier'>): Promise<void> {
    const marketplaceConnectListing =
      findMarketplaceConnectListing(universalIdentifier);

    if (!isDefined(marketplaceConnectListing)) {
      throw new ApplicationException(
        `Verified OAuth client ${universalIdentifier} has no store card`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const registration =
      await this.applicationRegistrationService.findOrCreateBuiltInRegistrationOrThrow(
        {
          universalIdentifier,
          name: marketplaceConnectListing.name,
          oAuthScopes: [...ALL_OAUTH_SCOPES],
        },
      );

    if (!isVerifiedOAuthClientRegistration(registration)) {
      throw new ApplicationException(
        `Universal identifier ${universalIdentifier} of a verified OAuth client is held by another registration`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }
  }
}
