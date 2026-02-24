import { transform } from 'esbuild';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

vi.mock('twenty-shared/application', () => ({
  DEFAULT_APP_ACCESS_TOKEN_NAME: 'TWENTY_APP_ACCESS_TOKEN',
  DEFAULT_API_KEY_NAME: 'TWENTY_API_KEY',
  DEFAULT_API_URL_NAME: 'TWENTY_API_URL',
  GENERATED_DIR: 'generated',
}));

import { ClientService } from '@/cli/utilities/client/client-service';

type TwentyClassType = new (options?: {
  url?: string;
  metadataUrl?: string;
  fetch?: typeof globalThis.fetch;
}) => {
  query: (request: Record<string, unknown>) => Promise<unknown>;
  uploadFile: (
    fileBuffer: Buffer,
    filename: string,
    contentType: string,
    fieldMetadataUniversalIdentifier: string,
  ) => Promise<{
    id: string;
    path: string;
    size: number;
    createdAt: string;
    url: string;
  }>;
};

const stubGeneratedIndexSource = `
export type QueryGenqlSelection = Record<string, unknown>
export type MutationGenqlSelection = Record<string, unknown>
export type GraphqlOperation = Record<string, unknown>

export type ClientOptions = {
  url?: string
  metadataUrl?: string
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>)
  fetcher?: (operation: GraphqlOperation | GraphqlOperation[]) => Promise<unknown>
  fetch?: typeof globalThis.fetch
  batch?: unknown
}

export type Client = {
  query: (request: QueryGenqlSelection & { __name?: string }) => Promise<unknown>
  mutation: (
    request: MutationGenqlSelection & { __name?: string },
  ) => Promise<unknown>
}

export class GenqlError extends Error {
  constructor(
    public readonly errors: unknown,
    public readonly data: unknown,
  ) {
    super('GenqlError')
  }
}

export const createClient = (options: ClientOptions): Client => {
  return {
    query: (request) => {
      return options.fetcher?.({
        query: 'query',
        variables: request,
      })
    },
    mutation: (request) => {
      return options.fetcher?.({
        query: 'mutation',
        variables: request,
      })
    },
  }
}
`;

const createJsonResponse = ({
  body,
  status = 200,
  statusText = 'OK',
}: {
  body: unknown;
  status?: number;
  statusText?: string;
}) =>
  new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  });

const getAuthorizationHeaderValue = (requestInit: RequestInit | undefined) => {
  return new Headers(requestInit?.headers).get('Authorization');
};

describe('ClientService generated Twenty auth behavior', () => {
  let temporaryGeneratedClientDirectory: string;
  let TwentyClass: TwentyClassType;

  beforeAll(async () => {
    temporaryGeneratedClientDirectory = await mkdtemp(
      join(tmpdir(), 'twenty-generated-client-'),
    );

    const temporaryGeneratedIndexTsPath = join(
      temporaryGeneratedClientDirectory,
      'index.ts',
    );

    await writeFile(temporaryGeneratedIndexTsPath, stubGeneratedIndexSource);

    const clientService = new ClientService();
    await (
      clientService as unknown as {
        injectTwentyClient: (output: string) => Promise<void>;
      }
    ).injectTwentyClient(temporaryGeneratedClientDirectory);

    const generatedIndexContent = await readFile(
      temporaryGeneratedIndexTsPath,
      'utf-8',
    );

    const transpiledModule = await transform(generatedIndexContent, {
      loader: 'ts',
      format: 'esm',
      target: 'es2022',
    });

    const temporaryGeneratedIndexMjsPath = join(
      temporaryGeneratedClientDirectory,
      'index.mjs',
    );
    await writeFile(temporaryGeneratedIndexMjsPath, transpiledModule.code);

    const generatedModule = await import(
      `${pathToFileURL(temporaryGeneratedIndexMjsPath).href}?t=${Date.now()}`
    );

    TwentyClass = generatedModule.default as TwentyClassType;
  });

  beforeEach(() => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    delete process.env.TWENTY_API_KEY;
    delete (globalThis as Record<string, unknown>)
      .frontComponentHostCommunicationApi;
  });

  afterAll(async () => {
    if (temporaryGeneratedClientDirectory) {
      await rm(temporaryGeneratedClientDirectory, {
        recursive: true,
        force: true,
      });
    }
  });

  it('uses TWENTY_APP_ACCESS_TOKEN before TWENTY_API_KEY', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'application-token';
    process.env.TWENTY_API_KEY = 'api-key-token';

    const capturedAuthorizationHeaders: string[] = [];
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, requestInit?: RequestInit) => {
        const authorizationHeaderValue =
          getAuthorizationHeaderValue(requestInit);

        if (authorizationHeaderValue) {
          capturedAuthorizationHeaders.push(authorizationHeaderValue);
        }

        return createJsonResponse({
          body: { data: { record: { id: 'record-id' } } },
        });
      },
    );

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await twentyClient.query({ record: { id: true } });

    expect(capturedAuthorizationHeaders).toEqual(['Bearer application-token']);
  });

  it('falls back to TWENTY_API_KEY when TWENTY_APP_ACCESS_TOKEN is absent', async () => {
    process.env.TWENTY_API_KEY = 'legacy-api-key-token';

    const capturedAuthorizationHeaders: string[] = [];
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, requestInit?: RequestInit) => {
        const authorizationHeaderValue =
          getAuthorizationHeaderValue(requestInit);

        if (authorizationHeaderValue) {
          capturedAuthorizationHeaders.push(authorizationHeaderValue);
        }

        return createJsonResponse({
          body: { data: { record: { id: 'record-id' } } },
        });
      },
    );

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await twentyClient.query({ record: { id: true } });

    expect(capturedAuthorizationHeaders).toEqual([
      'Bearer legacy-api-key-token',
    ]);
  });

  it('refreshes and retries once after auth error when refresh callback is available', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'stale-token';

    const requestAccessTokenRefresh = vi
      .fn<() => Promise<string>>()
      .mockResolvedValue('fresh-token');

    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      {
        requestAccessTokenRefresh,
      };

    const fetchMock = vi.fn(
      async (_url: string | URL | Request, requestInit?: RequestInit) => {
        const authorizationHeaderValue =
          getAuthorizationHeaderValue(requestInit);

        if (authorizationHeaderValue === 'Bearer stale-token') {
          return createJsonResponse({
            body: {
              errors: [
                {
                  extensions: { code: 'UNAUTHENTICATED' },
                  message: 'Unauthorized',
                },
              ],
            },
          });
        }

        return createJsonResponse({
          body: { data: { record: { id: 'record-id' } } },
        });
      },
    );

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    const queryResult = await twentyClient.query({ record: { id: true } });

    expect(queryResult).toEqual({ data: { record: { id: 'record-id' } } });
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(process.env.TWENTY_APP_ACCESS_TOKEN).toBe('fresh-token');
    expect(process.env.TWENTY_API_KEY).toBe('fresh-token');
  });

  it('deduplicates concurrent token refresh requests', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'stale-token';

    const requestAccessTokenRefresh = vi
      .fn<() => Promise<string>>()
      .mockImplementation(async () => {
        await Promise.resolve();
        return 'fresh-token';
      });

    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      {
        requestAccessTokenRefresh,
      };

    const fetchMock = vi.fn(
      async (_url: string | URL | Request, requestInit?: RequestInit) => {
        const authorizationHeaderValue =
          getAuthorizationHeaderValue(requestInit);

        if (authorizationHeaderValue === 'Bearer stale-token') {
          return createJsonResponse({
            body: {
              errors: [
                {
                  extensions: { code: 'UNAUTHENTICATED' },
                  message: 'Unauthorized',
                },
              ],
            },
          });
        }

        return createJsonResponse({
          body: { data: { record: { id: 'record-id' } } },
        });
      },
    );

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await Promise.all([
      twentyClient.query({ record: { id: true } }),
      twentyClient.query({ record: { id: true } }),
    ]);

    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('retries uploadFile once after 401 when refresh callback is available', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'stale-token';

    const requestAccessTokenRefresh = vi
      .fn<() => Promise<string>>()
      .mockResolvedValue('fresh-token');

    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      {
        requestAccessTokenRefresh,
      };

    const fetchMock = vi.fn(
      async (_url: string | URL | Request, requestInit?: RequestInit) => {
        const authorizationHeaderValue =
          getAuthorizationHeaderValue(requestInit);

        if (authorizationHeaderValue === 'Bearer stale-token') {
          return createJsonResponse({
            body: { message: 'Unauthorized' },
            status: 401,
            statusText: 'Unauthorized',
          });
        }

        return createJsonResponse({
          body: {
            data: {
              uploadFilesFieldFileByUniversalIdentifier: {
                id: 'uploaded-file-id',
                path: 'test/path.txt',
                size: 10,
                createdAt: '2026-02-24T00:00:00.000Z',
                url: 'https://example.com/test/path.txt',
              },
            },
          },
        });
      },
    );

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      metadataUrl: 'https://example.com/metadata',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    const uploadResult = await twentyClient.uploadFile(
      Buffer.from('content'),
      'test.txt',
      'text/plain',
      'field-uuid',
    );

    expect(uploadResult.id).toBe('uploaded-file-id');
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('bubbles auth error when refresh callback throws', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'stale-token';

    const requestAccessTokenRefresh = vi
      .fn<() => Promise<string>>()
      .mockRejectedValue(new Error('refresh failed'));

    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      {
        requestAccessTokenRefresh,
      };

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const fetchMock = vi.fn(async () => {
      return createJsonResponse({
        body: { message: 'Unauthorized' },
        status: 401,
        statusText: 'Unauthorized',
      });
    });

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await expect(twentyClient.query({ record: { id: true } })).rejects.toThrow(
      'Unauthorized',
    );
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Twenty client: token refresh failed',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('bubbles auth error when refresh callback returns an empty token', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'stale-token';

    const requestAccessTokenRefresh = vi
      .fn<() => Promise<string>>()
      .mockResolvedValue('');

    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      {
        requestAccessTokenRefresh,
      };

    const fetchMock = vi.fn(async () => {
      return createJsonResponse({
        body: { message: 'Unauthorized' },
        status: 401,
        statusText: 'Unauthorized',
      });
    });

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await expect(twentyClient.query({ record: { id: true } })).rejects.toThrow(
      'Unauthorized',
    );
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bubbles auth error without retry when refresh callback is unavailable', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'stale-token';

    const fetchMock = vi.fn(async () => {
      return createJsonResponse({
        body: { message: 'Unauthorized' },
        status: 401,
        statusText: 'Unauthorized',
      });
    });

    const twentyClient = new TwentyClass({
      url: 'https://example.com/graphql',
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await expect(twentyClient.query({ record: { id: true } })).rejects.toThrow(
      'Unauthorized',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('calls global fetch with globalThis binding when no custom fetch is provided', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'application-token';

    const originalFetch = globalThis.fetch;
    const capturedFetchThisValues: unknown[] = [];

    const fetchMock = vi.fn(function (
      this: unknown,
      _url: string | URL | Request,
      _requestInit?: RequestInit,
    ) {
      capturedFetchThisValues.push(this);

      return Promise.resolve(
        createJsonResponse({
          body: { data: { record: { id: 'record-id' } } },
        }),
      );
    }) as unknown as typeof globalThis.fetch;

    globalThis.fetch = fetchMock;

    try {
      const twentyClient = new TwentyClass({
        url: 'https://example.com/graphql',
      });

      await twentyClient.query({ record: { id: true } });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(capturedFetchThisValues).toEqual([globalThis]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
