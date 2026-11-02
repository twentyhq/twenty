import { Test, type TestingModule } from '@nestjs/testing';

import { isDefined } from 'twenty-shared/utils';

import { CLIENT_ID_METADATA_DOCUMENT_LIMITS } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-limits.constant';
import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { type CachedClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/cached-client-id-metadata-document.type';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

const DOCUMENT_URL = 'https://claude.ai/oauth/mcp-client-metadata';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

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
  let cache: Map<
    string,
    { value: CachedClientIdMetadataDocument; expiresAt: number }
  >;

  const moveClockPastRefresh = () => {
    const now = Date.now();

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(now + CLIENT_ID_METADATA_DOCUMENT_LIMITS.refreshAfterMs);
  };

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
            get: async (key: string) => {
              const storedEntry = cache.get(key);

              return isDefined(storedEntry) &&
                Date.now() < storedEntry.expiresAt
                ? storedEntry.value
                : undefined;
            },
            set: async (
              key: string,
              value: CachedClientIdMetadataDocument,
              ttlMs: number,
            ) => {
              cache.set(key, { value, expiresAt: Date.now() + ttlMs });
            },
          },
        },
      ],
    }).compile();

    service = module.get(ClientIdMetadataDocumentService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    moveClockPastRefresh();
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
    moveClockPastRefresh();
    httpGet.mockRejectedValueOnce(
      Object.assign(new Error('Not found'), {
        isAxiosError: true,
        response: { status: 404 },
      }),
    );

    await expect(service.findDocument(DOCUMENT_URL)).resolves.toBeNull();
  });

  describe('while its host is unreachable', () => {
    const START = 1_700_000_000_000;

    const setClock = (elapsedMs: number) => {
      jest.spyOn(Date, 'now').mockReturnValue(START + elapsedMs);
    };

    it('serves the last good document until a day after it was fetched, however often it is asked', async () => {
      setClock(0);
      await service.findDocument(DOCUMENT_URL);
      httpGet.mockRejectedValue(new Error('ECONNREFUSED'));

      setClock(23 * HOUR_MS);
      await expect(service.findDocument(DOCUMENT_URL)).resolves.toMatchObject({
        clientName: 'Claude',
      });

      setClock(23 * HOUR_MS + 30 * MINUTE_MS);
      await expect(service.findDocument(DOCUMENT_URL)).resolves.toMatchObject({
        clientName: 'Claude',
      });

      setClock(24 * HOUR_MS + MINUTE_MS);
      await expect(service.findDocument(DOCUMENT_URL)).resolves.toBeNull();
      expect(httpGet).toHaveBeenCalledTimes(4);
    });

    it('counts the day from the latest successful fetch', async () => {
      setClock(0);
      await service.findDocument(DOCUMENT_URL);

      httpGet.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      setClock(23 * HOUR_MS);
      await service.findDocument(DOCUMENT_URL);

      setClock(23 * HOUR_MS + 10 * MINUTE_MS);
      await service.findDocument(DOCUMENT_URL);

      httpGet.mockRejectedValue(new Error('ECONNREFUSED'));
      setClock(46 * HOUR_MS);
      await expect(service.findDocument(DOCUMENT_URL)).resolves.toMatchObject({
        clientName: 'Claude',
      });
    });
  });
});
