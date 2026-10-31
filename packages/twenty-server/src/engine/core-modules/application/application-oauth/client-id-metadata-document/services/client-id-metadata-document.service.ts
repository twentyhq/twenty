import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CLIENT_ID_METADATA_DOCUMENT_LIMITS } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-limits.constant';
import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { parseClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/parse-client-id-metadata-document.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

@Injectable()
export class ClientIdMetadataDocumentService {
  private readonly logger = new Logger(ClientIdMetadataDocumentService.name);

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    @InjectCacheStorage(CacheStorageNamespace.EngineOAuthClientMetadataDocument)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async findDocument(
    clientIdMetadataDocumentUrl: string,
  ): Promise<ClientIdMetadataDocument | null> {
    const cachedDocument =
      await this.cacheStorage.get<ClientIdMetadataDocument>(
        clientIdMetadataDocumentUrl,
      );

    if (isDefined(cachedDocument)) {
      return cachedDocument;
    }

    const document = await this.fetchDocument(clientIdMetadataDocumentUrl);

    if (isDefined(document)) {
      await this.cacheStorage.set(
        clientIdMetadataDocumentUrl,
        document,
        CLIENT_ID_METADATA_DOCUMENT_LIMITS.cacheTtlMs,
      );
    }

    return document;
  }

  private async fetchDocument(
    clientIdMetadataDocumentUrl: string,
  ): Promise<ClientIdMetadataDocument | null> {
    try {
      // A redirect would hand the client identity to another URL than the client_id
      const response = await this.secureHttpClientService
        .getHttpClient({
          timeout: CLIENT_ID_METADATA_DOCUMENT_LIMITS.fetchTimeoutMs,
          maxContentLength: CLIENT_ID_METADATA_DOCUMENT_LIMITS.maxSizeBytes,
          maxRedirects: 0,
          headers: { Accept: 'application/json' },
          responseType: 'json',
        })
        .get<unknown>(clientIdMetadataDocumentUrl);

      const parsedDocument = parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl,
        rawDocument: response.data,
      });

      if ('error' in parsedDocument) {
        this.logger.warn(
          `Rejected client ID metadata document ${clientIdMetadataDocumentUrl}: ${parsedDocument.error}`,
        );

        return null;
      }

      return parsedDocument.document;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch client ID metadata document ${clientIdMetadataDocumentUrl}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }
}
