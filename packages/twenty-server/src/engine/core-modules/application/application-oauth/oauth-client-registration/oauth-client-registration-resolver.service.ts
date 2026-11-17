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
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

@Injectable()
export class OAuthClientRegistrationResolverService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly clientIdMetadataDocumentService: ClientIdMetadataDocumentService,
    private readonly throttlerService: ThrottlerService,
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
  findRegistrationByOAuthClientId(oAuthClientId: string) {
    return this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId },
    });
  }

  // Only for a signed-in user's authorization: the public token and consent endpoints would store a row for any hosted URL
  async registerClientIdMetadataDocumentClient({
    clientIdMetadataDocument,
    registration: existingRegistration,
  }: Pick<
    Extract<ResolvedOAuthClient, { kind: 'clientIdMetadataDocument' }>,
    'clientIdMetadataDocument' | 'registration'
  >): Promise<void> {
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
}
