import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { CLIENT_ID_METADATA_DOCUMENT_CACHE_TTL_MS } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/constants/client-id-metadata-document-cache-ttl-ms.constant';
import { CLIENT_ID_METADATA_DOCUMENT_FETCH_TIMEOUT_MS } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/constants/client-id-metadata-document-fetch-timeout-ms.constant';
import { CLIENT_ID_METADATA_DOCUMENT_MAX_SIZE_BYTES } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/constants/client-id-metadata-document-max-size-bytes.constant';
import { parseClientIdMetadataDocument } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/utils/parse-client-id-metadata-document.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

@Injectable()
export class ClientIdMetadataDocumentService {
  private readonly logger = new Logger(ClientIdMetadataDocumentService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async findOrSyncRegistration(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    const existingRegistration =
      await this.applicationRegistrationRepository.findOne({
        where: { oAuthClientId: clientId },
      });

    if (
      isDefined(existingRegistration) &&
      (existingRegistration.sourceType !==
        ApplicationRegistrationSourceType.OAUTH_ONLY ||
        Date.now() - existingRegistration.updatedAt.getTime() <
          CLIENT_ID_METADATA_DOCUMENT_CACHE_TTL_MS)
    ) {
      return existingRegistration;
    }

    const fetchedDocument = await this.fetchDocument(clientId);

    if (!fetchedDocument.isFetched) {
      return existingRegistration;
    }

    const document = parseClientIdMetadataDocument(
      fetchedDocument.body,
      clientId,
    );

    if (!isDefined(document)) {
      this.logger.warn(`Invalid client ID metadata document at ${clientId}`);

      return null;
    }

    const registrationFields = {
      name: document.clientName,
      oAuthRedirectUris: document.redirectUris,
      oAuthScopes: document.scopes,
      logo: document.logoUri,
    };

    if (isDefined(existingRegistration)) {
      await this.applicationRegistrationRepository.update(
        existingRegistration.id,
        registrationFields,
      );

      return this.applicationRegistrationRepository.findOne({
        where: { id: existingRegistration.id },
      });
    }

    try {
      return await this.applicationRegistrationRepository.save(
        this.applicationRegistrationRepository.create({
          ...registrationFields,
          universalIdentifier: v4(),
          oAuthClientId: clientId,
          oAuthClientSecretHash: null,
          createdByUserId: null,
          ownerWorkspaceId: null,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        }),
      );
    } catch (error) {
      const concurrentlyCreatedRegistration =
        await this.applicationRegistrationRepository.findOne({
          where: { oAuthClientId: clientId },
        });

      if (isDefined(concurrentlyCreatedRegistration)) {
        return concurrentlyCreatedRegistration;
      }

      throw error;
    }
  }

  private async fetchDocument(
    clientId: string,
  ): Promise<{ isFetched: true; body: unknown } | { isFetched: false }> {
    try {
      const response = await this.secureHttpClientService
        .getHttpClient({
          timeout: CLIENT_ID_METADATA_DOCUMENT_FETCH_TIMEOUT_MS,
          maxContentLength: CLIENT_ID_METADATA_DOCUMENT_MAX_SIZE_BYTES,
          maxRedirects: 0,
          headers: { Accept: 'application/json' },
        })
        .get<unknown>(clientId);

      return { isFetched: true, body: response.data };
    } catch (error) {
      this.logger.warn(
        `Could not fetch client ID metadata document at ${clientId}`,
        error,
      );

      return { isFetched: false };
    }
  }
}
