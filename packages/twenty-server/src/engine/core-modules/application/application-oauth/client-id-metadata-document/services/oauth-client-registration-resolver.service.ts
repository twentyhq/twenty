import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';
import { findWellKnownOAuthClientByClientIdMetadataDocument } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-client-id-metadata-document.util';

// Resolves the client_id of an authorize or token request: a registered client id, or the URL of a
// Client ID Metadata Document, which stands for one registration per URL instead of one per connection
@Injectable()
export class OAuthClientRegistrationResolverService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly clientIdMetadataDocumentService: ClientIdMetadataDocumentService,
    private readonly wellKnownOAuthClientRegistrationService: WellKnownOAuthClientRegistrationService,
  ) {}

  async resolveByClientId(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    if (!isClientIdMetadataDocumentUrl(clientId)) {
      return this.applicationRegistrationRepository.findOne({
        where: { oAuthClientId: clientId },
      });
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
      return this.wellKnownOAuthClientRegistrationService.findOrCreateRegistration(
        wellKnownOAuthClient,
      );
    }

    return this.upsertClientIdMetadataDocumentRegistration(
      clientIdMetadataDocument,
    );
  }

  private async upsertClientIdMetadataDocumentRegistration(
    clientIdMetadataDocument: ClientIdMetadataDocument,
  ): Promise<ApplicationRegistrationEntity | null> {
    const documentFields = {
      name:
        clientIdMetadataDocument.clientName ??
        new URL(clientIdMetadataDocument.clientId).hostname,
      logo: clientIdMetadataDocument.logoUri,
      oAuthRedirectUris: clientIdMetadataDocument.redirectUris,
    };

    const existingRegistration =
      await this.applicationRegistrationRepository.findOne({
        where: { oAuthClientId: clientIdMetadataDocument.clientId },
      });

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

    return this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId: clientIdMetadataDocument.clientId },
    });
  }
}
