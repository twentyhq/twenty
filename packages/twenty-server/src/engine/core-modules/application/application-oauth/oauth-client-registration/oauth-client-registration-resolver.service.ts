import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

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

// Resolves the client_id of an authorize, token or consent-screen request: a registered client id, or the URL of a
// Client ID Metadata Document, which stands for one registration per URL instead of one per connection
@Injectable()
export class OAuthClientRegistrationResolverService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly clientIdMetadataDocumentService: ClientIdMetadataDocumentService,
    private readonly wellKnownOAuthClientRegistrationService: WellKnownOAuthClientRegistrationService,
  ) {}

  async findByClientId(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return (await this.resolveClient(clientId))?.registration ?? null;
  }

  // Only called once a signed-in user authorizes the client: the token and consent-screen endpoints are public,
  // and would otherwise store a registration for any document URL a caller hosts
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
    const { id, ...documentFields } =
      toClientIdMetadataDocumentRegistrationFields(clientIdMetadataDocument);

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

    await this.applicationRegistrationRepository
      .createQueryBuilder()
      .insert()
      .into(ApplicationRegistrationEntity)
      .values({
        ...documentFields,
        id,
        universalIdentifier: id,
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
