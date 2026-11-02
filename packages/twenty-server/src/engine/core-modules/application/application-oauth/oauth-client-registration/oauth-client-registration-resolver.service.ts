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
import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/resolved-oauth-client.type';
import { toClientIdMetadataDocumentRegistrationFields } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/to-client-id-metadata-document-registration-fields.util';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';
import { findWellKnownOAuthClientByClientIdMetadataDocument } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-client-id-metadata-document.util';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

// A client_id is a registered id or a Client ID Metadata Document URL, which maps to one registration per URL, not per connection
@Injectable()
export class OAuthClientRegistrationResolverService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly clientIdMetadataDocumentService: ClientIdMetadataDocumentService,
    private readonly wellKnownOAuthClientRegistrationService: WellKnownOAuthClientRegistrationService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  // The public OAuth endpoints let anyone make the server fetch a URL, so those fetches are rationed per IP
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
      `oauth-client-metadata-document-fetch:${requestIp}`,
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

  // Only for a signed-in user's authorization: the public token and consent endpoints would store a row for any hosted URL
  async findOrRegisterByClientId(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    const resolvedClient = await this.resolveClient(clientId);

    if (!isDefined(resolvedClient)) {
      return null;
    }

    if (!isDefined(resolvedClient.clientIdMetadataDocument)) {
      return resolvedClient.registration;
    }

    return this.upsertClientIdMetadataDocumentRegistration({
      clientIdMetadataDocument: resolvedClient.clientIdMetadataDocument,
      existingRegistration: resolvedClient.registration,
    });
  }

  async resolveClient(clientId: string): Promise<ResolvedOAuthClient | null> {
    if (!isClientIdMetadataDocumentUrl(clientId)) {
      const registration = await this.findRegistrationByOAuthClientId(clientId);

      return isDefined(registration)
        ? { registration, clientIdMetadataDocument: null }
        : null;
    }

    const clientIdMetadataDocument =
      await this.clientIdMetadataDocumentService.findDocument(clientId);

    if (!isDefined(clientIdMetadataDocument)) {
      return null;
    }

    const wellKnownOAuthClient =
      findWellKnownOAuthClientByClientIdMetadataDocument(
        clientIdMetadataDocument,
      );

    if (isDefined(wellKnownOAuthClient)) {
      return {
        registration:
          await this.wellKnownOAuthClientRegistrationService.findOrCreateRegistration(
            wellKnownOAuthClient,
          ),
        clientIdMetadataDocument: null,
      };
    }

    return {
      registration: await this.findRegistrationByOAuthClientId(clientId),
      clientIdMetadataDocument,
    };
  }

  private findRegistrationByOAuthClientId(oAuthClientId: string) {
    return this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId },
    });
  }

  private async upsertClientIdMetadataDocumentRegistration({
    clientIdMetadataDocument,
    existingRegistration,
  }: {
    clientIdMetadataDocument: ClientIdMetadataDocument;
    existingRegistration: ApplicationRegistrationEntity | null;
  }): Promise<ApplicationRegistrationEntity | null> {
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

      if (!hasDocumentChanged) {
        return existingRegistration;
      }

      await this.applicationRegistrationRepository.update(
        existingRegistration.id,
        documentFields,
      );

      return { ...existingRegistration, ...documentFields };
    }

    // A concurrent first authorization trips the oAuthClientId unique index, and the lookup below returns its row
    await this.applicationRegistrationRepository
      .createQueryBuilder()
      .insert()
      .into(ApplicationRegistrationEntity)
      .values({
        ...documentFields,
        universalIdentifier: v4(),
        oAuthClientId: clientIdMetadataDocument.clientId,
        oAuthClientSecretHash: null,
        oAuthScopes: [...ALL_OAUTH_SCOPES],
        ownerWorkspaceId: null,
        createdByUserId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      })
      .orIgnore()
      .execute();

    return this.findRegistrationByOAuthClientId(
      clientIdMetadataDocument.clientId,
    );
  }
}
