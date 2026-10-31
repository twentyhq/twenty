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

  it('keeps serving the last document while its host is unreachable', async () => {
    await service.findDocument(DOCUMENT_URL);
    cache.set(DOCUMENT_URL, {
      ...(cache.get(DOCUMENT_URL) as object),
      fetchedAt: 0,
    });
    httpGet.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await expect(service.findDocument(DOCUMENT_URL)).resolves.toMatchObject({
      clientName: 'Claude',
    });
    await service.findDocument(DOCUMENT_URL);
    expect(httpGet).toHaveBeenCalledTimes(2);
  });

  it('remembers a document that cannot be used, without fetching it again right away', async () => {
    httpGet.mockResolvedValue({
      data: { ...RAW_DOCUMENT, client_id: 'https://example.com/x' },
    });

    await expect(service.findDocument(DOCUMENT_URL)).resolves.toBeNull();
    await expect(service.findDocument(DOCUMENT_URL)).resolves.toBeNull();
    expect(httpGet).toHaveBeenCalledTimes(1);
  });

  it('drops a document its host withdrew', async () => {
    await service.findDocument(DOCUMENT_URL);
    cache.set(DOCUMENT_URL, {
      ...(cache.get(DOCUMENT_URL) as object),
      fetchedAt: 0,
    });
    httpGet.mockRejectedValueOnce(
      Object.assign(new Error('Not found'), {
        isAxiosError: true,
        response: { status: 404 },
      }),
    );

    await expect(service.findDocument(DOCUMENT_URL)).resolves.toBeNull();
  });
});
