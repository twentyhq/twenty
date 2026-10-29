import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  CLIENT_ID_METADATA_DOCUMENT_FETCH_TIMEOUT_MS,
  CLIENT_ID_METADATA_DOCUMENT_MAX_SIZE_BYTES,
  CLIENT_ID_METADATA_DOCUMENT_REFRESH_INTERVAL_MS,
} from 'src/engine/core-modules/application/application-registration/constants/client-id-metadata-document.constant';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  type ClientIdMetadataDocument,
  parseClientIdMetadataDocument,
} from 'src/engine/core-modules/application/application-registration/utils/parse-client-id-metadata-document.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

// Client ID Metadata Documents (draft-ietf-oauth-client-id-metadata-document): the client_id is an
// HTTPS URL serving the client metadata, so a client keeps one registration across reconnects
@Injectable()
export class ApplicationRegistrationClientIdMetadataDocumentService {
  private readonly logger = new Logger(
    ApplicationRegistrationClientIdMetadataDocumentService.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async findOrRefreshRegistration(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    const existingRegistration =
      await this.applicationRegistrationRepository.findOne({
        where: { oAuthClientId: clientId },
      });

    const isFresh =
      existingRegistration !== null &&
      Date.now() - existingRegistration.updatedAt.getTime() <
        CLIENT_ID_METADATA_DOCUMENT_REFRESH_INTERVAL_MS;

    if (isFresh) {
      return existingRegistration;
    }

    let document: unknown;

    try {
      document = await this.fetchDocument(clientId);
    } catch (error) {
      this.logger.warn(
        `Could not fetch client metadata document ${clientId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      // A transient outage on the client's host must not sign its users out
      return existingRegistration;
    }

    const parseResult = parseClientIdMetadataDocument({ clientId, document });

    if (!parseResult.valid) {
      this.logger.warn(
        `Invalid client metadata document ${clientId}: ${parseResult.reason}`,
      );

      return null;
    }

    if (existingRegistration) {
      await this.applicationRegistrationRepository.update(
        { id: existingRegistration.id },
        {
          ...this.toRegistrationFields(parseResult.metadata),
          updatedAt: new Date(),
        },
      );

      return this.applicationRegistrationRepository.findOne({
        where: { id: existingRegistration.id },
      });
    }

    return this.createRegistration(clientId, parseResult.metadata);
  }

  private async fetchDocument(clientId: string): Promise<unknown> {
    const httpClient = this.secureHttpClientService.getHttpClient({
      timeout: CLIENT_ID_METADATA_DOCUMENT_FETCH_TIMEOUT_MS,
      maxContentLength: CLIENT_ID_METADATA_DOCUMENT_MAX_SIZE_BYTES,
      maxRedirects: 0,
      responseType: 'json',
      headers: { Accept: 'application/json' },
    });

    const response = await httpClient.get<unknown>(clientId);

    return response.data;
  }

  private async createRegistration(
    clientId: string,
    metadata: ClientIdMetadataDocument,
  ): Promise<ApplicationRegistrationEntity | null> {
    try {
      return await this.applicationRegistrationRepository.save(
        this.applicationRegistrationRepository.create({
          ...this.toRegistrationFields(metadata),
          universalIdentifier: v4(),
          oAuthClientId: clientId,
          oAuthClientSecretHash: null,
          createdByUserId: null,
          ownerWorkspaceId: null,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        }),
      );
    } catch (error) {
      // A concurrent request created it first: the unique client_id index rejects the duplicate
      const concurrentRegistration =
        await this.applicationRegistrationRepository.findOne({
          where: { oAuthClientId: clientId },
        });

      if (concurrentRegistration) {
        return concurrentRegistration;
      }

      throw error;
    }
  }

  private toRegistrationFields(metadata: ClientIdMetadataDocument) {
    return {
      name: metadata.name,
      oAuthRedirectUris: metadata.redirectUris,
      oAuthScopes: metadata.scopes,
      logo: metadata.logoUri,
      websiteUrl: metadata.clientUri,
    };
  }
}
