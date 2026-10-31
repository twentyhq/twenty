import { Test, type TestingModule } from '@nestjs/testing';

import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

const DOCUMENT_URL = 'https://claude.ai/oauth/mcp-client-metadata';

const RAW_DOCUMENT = {
  client_id: DOCUMENT_URL,
  client_name: 'Claude',
  redirect_uris: ['https://claude.ai/api/mcp/auth_callback'],
  token_endpoint_auth_method: 'none',
};

describe('ClientIdMetadataDocumentService', () => {
  let service: ClientIdMetadataDocumentService;
  let httpGet: jest.Mock;
  let getHttpClient: jest.Mock;
  let cache: Map<string, unknown>;

  beforeEach(async () => {
    cache = new Map();
    httpGet = jest.fn().mockResolvedValue({ data: RAW_DOCUMENT });
    getHttpClient = jest.fn(() => ({ get: httpGet }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientIdMetadataDocumentService,
        { provide: SecureHttpClientService, useValue: { getHttpClient } },
        {
          provide: CacheStorageNamespace.EngineOAuthClientMetadataDocument,
          useValue: {
            get: async (key: string) => cache.get(key),
            set: async (key: string, value: unknown) => {
              cache.set(key, value);
            },
          },
        },
      ],
    }).compile();

    service = module.get(ClientIdMetadataDocumentService);
  });

  it('fetches the document without following redirects and within a size cap', async () => {
    await expect(service.findDocument(DOCUMENT_URL)).resolves.toEqual({
      clientId: DOCUMENT_URL,
      clientName: 'Claude',
      logoUri: null,
      redirectUris: ['https://claude.ai/api/mcp/auth_callback'],
    });
    expect(getHttpClient).toHaveBeenCalledWith(
      expect.objectContaining({ maxRedirects: 0, maxContentLength: 5120 }),
    );
    expect(httpGet).toHaveBeenCalledWith(DOCUMENT_URL);
  });

  it('serves a fetched document from the cache', async () => {
    await service.findDocument(DOCUMENT_URL);
    await service.findDocument(DOCUMENT_URL);

    expect(httpGet).toHaveBeenCalledTimes(1);
  });

  it('returns nothing for an unreachable or invalid document, and does not cache it', async () => {
    httpGet.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await expect(service.findDocument(DOCUMENT_URL)).resolves.toBeNull();

    httpGet.mockResolvedValueOnce({
      data: { ...RAW_DOCUMENT, client_id: 'https://example.com/x' },
    });

    await expect(service.findDocument(DOCUMENT_URL)).resolves.toBeNull();
    expect(cache.size).toBe(0);
  });
});
