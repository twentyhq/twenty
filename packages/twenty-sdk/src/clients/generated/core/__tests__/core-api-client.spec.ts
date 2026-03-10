import { CoreApiClient } from '../index';

describe('CoreApiClient', () => {
  const TEST_API_URL = 'https://api.twenty.com';

  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = process.env;
    process.env = {
      ...savedEnv,
      TWENTY_API_URL: TEST_API_URL,
    };
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  // The internal fetcher wrapper expects the custom fetcher to return
  // the raw JSON response `{ data, errors }`. It then extracts `.data` and
  // throws CoreGraphqlError on errors. CoreApiClient's custom fetcher
  // returns the full payload from assertResponseIsSuccessful.
  const createMockFetch = (
    responseData: Record<string, unknown>,
    statusOverrides?: { status?: number; statusText?: string },
  ) => {
    return vi.fn().mockResolvedValue({
      status: statusOverrides?.status ?? 200,
      statusText: statusOverrides?.statusText ?? 'OK',
      text: () =>
        Promise.resolve(JSON.stringify({ data: responseData })),
    });
  };

  const parseSentBody = (mockFetch: ReturnType<typeof vi.fn>) => {
    return JSON.parse(mockFetch.mock.calls[0]![1].body) as {
      query: string;
      variables: Record<string, unknown>;
      operationName?: string;
    };
  };

  const getSentHeaders = (
    mockFetch: ReturnType<typeof vi.fn>,
    callIndex = 0,
  ) => {
    return new Headers(mockFetch.mock.calls[callIndex]![1].headers);
  };

  const createClient = (
    mockFetch: ReturnType<typeof vi.fn>,
    options?: Partial<ConstructorParameters<typeof CoreApiClient>[0]>,
  ) => {
    return new CoreApiClient({
      fetch: mockFetch,
      ...options,
    });
  };

  describe('query', () => {
    it('should produce a valid findMany query with pagination', async () => {
      const mockFetch = createMockFetch({ companies: { edges: [] } });
      const client = createClient(mockFetch);

      await client.query({
        companies: {
          __args: { first: 20, after: 'cursor-xyz' },
          edges: { node: { id: true, name: true } },
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'query ($v1:Int,$v2:String){companies(first:$v1,after:$v2){edges{node{id,name}}}}',
      );
      expect(body.variables).toEqual({ v1: 20, v2: 'cursor-xyz' });
    });

    it('should produce a valid findMany query with filter and orderBy', async () => {
      const mockFetch = createMockFetch({ companies: { edges: [] } });
      const client = createClient(mockFetch);

      await client.query({
        companies: {
          __args: {
            filter: { name: { eq: 'Acme' } },
            orderBy: [{ name: 'AscNullsFirst' }],
            first: 10,
          },
          edges: { node: { id: true } },
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toContain('$v1:CompaniesFilterInput');
      expect(body.query).toContain('$v2:[CompaniesOrderByInput]');
      expect(body.query).toContain('$v3:Int');
      expect(body.variables).toEqual({
        v1: { name: { eq: 'Acme' } },
        v2: [{ name: 'AscNullsFirst' }],
        v3: 10,
      });
    });

    it('should produce a valid findOne query', async () => {
      const mockFetch = createMockFetch({ company: { id: '1' } });
      const client = createClient(mockFetch);

      await client.query({
        company: {
          __args: { filter: { id: { eq: 'abc-123' } } },
          id: true,
          name: true,
          createdAt: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'query ($v1:CompanyFilterInput){company(filter:$v1){id,name,createdAt}}',
      );
      expect(body.variables).toEqual({
        v1: { id: { eq: 'abc-123' } },
      });
    });

    it('should produce a valid query without args', async () => {
      const mockFetch = createMockFetch({ companies: { edges: [] } });
      const client = createClient(mockFetch);

      await client.query({
        companies: {
          edges: { node: { id: true, name: true } },
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'query {companies{edges{node{id,name}}}}',
      );
      expect(body.variables).toEqual({});
    });
  });

  describe('mutation', () => {
    it('should produce a valid createOne mutation', async () => {
      const mockFetch = createMockFetch({
        createCompany: { id: 'new-id' },
      });
      const client = createClient(mockFetch);

      await client.mutation({
        createCompany: {
          __args: { data: { name: 'Acme', employees: 50 } },
          id: true,
          name: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'mutation ($v1:CompanyCreateInput!){createCompany(data:$v1){id,name}}',
      );
      expect(body.variables).toEqual({
        v1: { name: 'Acme', employees: 50 },
      });
    });

    it('should produce a valid updateOne mutation', async () => {
      const mockFetch = createMockFetch({
        updateCompany: { id: 'abc-123' },
      });
      const client = createClient(mockFetch);

      await client.mutation({
        updateCompany: {
          __args: {
            id: 'abc-123',
            data: { name: 'Updated Corp' },
          },
          id: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'mutation ($v1:UUID!,$v2:CompanyUpdateInput!){updateCompany(id:$v1,data:$v2){id}}',
      );
      expect(body.variables).toEqual({
        v1: 'abc-123',
        v2: { name: 'Updated Corp' },
      });
    });

    it('should produce a valid deleteOne mutation', async () => {
      const mockFetch = createMockFetch({
        deleteCompany: { id: 'abc-123' },
      });
      const client = createClient(mockFetch);

      await client.mutation({
        deleteCompany: {
          __args: { id: 'abc-123' },
          id: true,
          deletedAt: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'mutation ($v1:UUID!){deleteCompany(id:$v1){id,deletedAt}}',
      );
      expect(body.variables).toEqual({ v1: 'abc-123' });
    });

    it('should produce a valid destroyOne mutation', async () => {
      const mockFetch = createMockFetch({
        destroyPerson: { id: 'p-1' },
      });
      const client = createClient(mockFetch);

      await client.mutation({
        destroyPerson: {
          __args: { id: 'p-1' },
          id: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'mutation ($v1:UUID!){destroyPerson(id:$v1){id}}',
      );
    });

    it('should produce a valid restoreOne mutation', async () => {
      const mockFetch = createMockFetch({
        restoreCompany: { id: 'abc-123' },
      });
      const client = createClient(mockFetch);

      await client.mutation({
        restoreCompany: {
          __args: { id: 'abc-123' },
          id: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toBe(
        'mutation ($v1:UUID!){restoreCompany(id:$v1){id}}',
      );
    });

    it('should produce a valid updateMany mutation', async () => {
      const mockFetch = createMockFetch({
        updateCompanies: [{ id: '1' }],
      });
      const client = createClient(mockFetch);

      await client.mutation({
        updateCompanies: {
          __args: {
            data: { name: 'Bulk Updated' },
            filter: { name: { eq: 'Old Name' } },
          },
          id: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toContain('$v1:CompaniesUpdateInput!');
      expect(body.query).toContain('$v2:CompaniesFilterInput!');
    });

    it('should produce a valid deleteMany mutation', async () => {
      const mockFetch = createMockFetch({
        deleteCompanies: [{ id: '1' }],
      });
      const client = createClient(mockFetch);

      await client.mutation({
        deleteCompanies: {
          __args: { filter: { name: { eq: 'test' } } },
          id: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toContain('$v1:CompaniesFilterInput!');
    });

    it('should produce a valid mergeMany mutation', async () => {
      const mockFetch = createMockFetch({
        mergeCompanies: { id: 'merged' },
      });
      const client = createClient(mockFetch);

      await client.mutation({
        mergeCompanies: {
          __args: {
            ids: ['id-1', 'id-2'],
            conflictPriorityIndex: 0,
            dryRun: true,
          },
          id: true,
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toContain('$v1:[UUID!]!');
      expect(body.query).toContain('$v2:Int!');
      expect(body.query).toContain('$v3:Boolean');
      expect(body.variables).toEqual({
        v1: ['id-1', 'id-2'],
        v2: 0,
        v3: true,
      });
    });

    it('should handle nested field selections in mutations', async () => {
      const mockFetch = createMockFetch({
        createCompany: {
          id: 'new-id',
          people: { edges: [{ node: { id: 'p-1' } }] },
        },
      });
      const client = createClient(mockFetch);

      await client.mutation({
        createCompany: {
          __args: { data: { name: 'Acme' } },
          id: true,
          people: {
            edges: {
              node: {
                id: true,
                name: { firstName: true, lastName: true },
              },
            },
          },
        },
      });

      const body = parseSentBody(mockFetch);

      expect(body.query).toContain(
        'people{edges{node{id,name{firstName,lastName}}}}',
      );
    });
  });

  describe('request configuration', () => {
    it('should default URL to TWENTY_API_URL/graphql from env', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch);

      await client.query({ companies: { edges: { node: { id: true } } } });

      expect(mockFetch.mock.calls[0]![0]).toBe(
        `${TEST_API_URL}/graphql`,
      );
    });

    it('should allow overriding the URL', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch, {
        url: 'https://custom.api.com/gql',
      });

      await client.query({ companies: { edges: { node: { id: true } } } });

      expect(mockFetch.mock.calls[0]![0]).toBe(
        'https://custom.api.com/gql',
      );
    });

    it('should use POST method', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch);

      await client.query({ companies: { edges: { node: { id: true } } } });

      expect(mockFetch.mock.calls[0]![1].method).toBe('POST');
    });

    it('should set Content-Type to application/json', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch);

      await client.query({ companies: { edges: { node: { id: true } } } });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('authentication', () => {
    it('should set Authorization header from explicit Bearer token', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch, {
        headers: { Authorization: 'Bearer my-token' },
      });

      await client.query({ companies: { edges: { node: { id: true } } } });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('Authorization')).toBe('Bearer my-token');
    });

    it('should pick up token from TWENTY_APP_ACCESS_TOKEN env var', async () => {
      process.env.TWENTY_APP_ACCESS_TOKEN = 'env-app-token';

      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch);

      await client.query({
        companies: { edges: { node: { id: true } } },
      });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('Authorization')).toBe('Bearer env-app-token');
    });

    it('should pick up token from TWENTY_API_KEY env var as fallback', async () => {
      delete process.env.TWENTY_APP_ACCESS_TOKEN;
      process.env.TWENTY_API_KEY = 'env-api-key';

      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch);

      await client.query({
        companies: { edges: { node: { id: true } } },
      });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('Authorization')).toBe('Bearer env-api-key');
    });

    it('should prioritize explicit header over env vars', async () => {
      process.env.TWENTY_APP_ACCESS_TOKEN = 'env-token';

      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch, {
        headers: { Authorization: 'Bearer explicit-token' },
      });

      await client.query({
        companies: { edges: { node: { id: true } } },
      });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('Authorization')).toBe(
        'Bearer explicit-token',
      );
    });

    it('should not set Authorization header when no token is available', async () => {
      delete process.env.TWENTY_APP_ACCESS_TOKEN;
      delete process.env.TWENTY_API_KEY;

      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch);

      await client.query({
        companies: { edges: { node: { id: true } } },
      });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('Authorization')).toBeNull();
    });
  });

  describe('token refresh', () => {
    afterEach(() => {
      delete (globalThis as Record<string, unknown>)
        .frontComponentHostCommunicationApi;
    });

    it('should retry with refreshed token on 401 response', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          status: 401,
          statusText: 'Unauthorized',
          text: () =>
            Promise.resolve(JSON.stringify({ errors: [] })),
        })
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          text: () =>
            Promise.resolve(
              JSON.stringify({ data: { company: { id: '1' } } }),
            ),
        });

      const mockRefresh = vi.fn().mockResolvedValue('refreshed-token');

      (globalThis as Record<string, unknown>)
        .frontComponentHostCommunicationApi = {
        requestAccessTokenRefresh: mockRefresh,
      };

      process.env.TWENTY_APP_ACCESS_TOKEN = 'expired';

      const client = createClient(mockFetch);

      const result = await client.query({
        company: {
          __args: { filter: { id: { eq: 'abc' } } },
          id: true,
        },
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockRefresh).toHaveBeenCalledTimes(1);

      const retryHeaders = getSentHeaders(mockFetch, 1);

      expect(retryHeaders.get('Authorization')).toBe(
        'Bearer refreshed-token',
      );
      // genql runtime unwraps .data from the payload
      expect(result).toEqual({ company: { id: '1' } });
    });

    it('should retry on UNAUTHENTICATED GraphQL error', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          text: () =>
            Promise.resolve(
              JSON.stringify({
                errors: [
                  { extensions: { code: 'UNAUTHENTICATED' } },
                ],
              }),
            ),
        })
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          text: () =>
            Promise.resolve(
              JSON.stringify({ data: { companies: [] } }),
            ),
        });

      (globalThis as Record<string, unknown>)
        .frontComponentHostCommunicationApi = {
        requestAccessTokenRefresh: vi
          .fn()
          .mockResolvedValue('new-token'),
      };

      const client = createClient(mockFetch);

      await client.query({
        companies: { edges: { node: { id: true } } },
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry when no refresh function is available', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 401,
        statusText: 'Unauthorized',
        text: () =>
          Promise.resolve(JSON.stringify({ errors: [] })),
      });

      const client = createClient(mockFetch);

      await expect(
        client.query({
          companies: { edges: { node: { id: true } } },
        }),
      ).rejects.toThrow('Unauthorized');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry when refresh returns empty string', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 401,
        statusText: 'Unauthorized',
        text: () =>
          Promise.resolve(JSON.stringify({ errors: [] })),
      });

      (globalThis as Record<string, unknown>)
        .frontComponentHostCommunicationApi = {
        requestAccessTokenRefresh: vi.fn().mockResolvedValue(''),
      };

      const client = createClient(mockFetch);

      await expect(
        client.query({
          companies: { edges: { node: { id: true } } },
        }),
      ).rejects.toThrow('Unauthorized');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry when refresh throws', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockFetch = vi.fn().mockResolvedValue({
        status: 401,
        statusText: 'Unauthorized',
        text: () =>
          Promise.resolve(JSON.stringify({ errors: [] })),
      });

      (globalThis as Record<string, unknown>)
        .frontComponentHostCommunicationApi = {
        requestAccessTokenRefresh: vi
          .fn()
          .mockRejectedValue(new Error('refresh failed')),
      };

      const client = createClient(mockFetch);

      await expect(
        client.query({
          companies: { edges: { node: { id: true } } },
        }),
      ).rejects.toThrow('Unauthorized');

      expect(mockFetch).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });

  describe('response handling', () => {
    it('should return unwrapped data on success', async () => {
      const mockFetch = createMockFetch({
        createCompany: { id: 'new-id', name: 'Acme' },
      });
      const client = createClient(mockFetch);

      const result = await client.mutation({
        createCompany: {
          __args: { data: { name: 'Acme' } },
          id: true,
          name: true,
        },
      });

      // genql runtime unwraps .data from the payload
      expect(result).toEqual({
        createCompany: { id: 'new-id', name: 'Acme' },
      });
    });

    it('should throw on non-2xx response with status text and body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('{"errors":[{"message":"boom"}]}'),
      });

      const client = createClient(mockFetch);

      await expect(
        client.mutation({
          createCompany: {
            __args: { data: { name: 'Acme' } },
            id: true,
          },
        }),
      ).rejects.toThrow('Internal Server Error');
    });

    it('should throw on empty response body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(''),
      });

      const client = createClient(mockFetch);

      await expect(
        client.query({
          companies: { edges: { node: { id: true } } },
        }),
      ).rejects.toThrow('Invalid JSON response');
    });

    it('should throw on malformed JSON response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('not json'),
      });

      const client = createClient(mockFetch);

      await expect(
        client.query({
          companies: { edges: { node: { id: true } } },
        }),
      ).rejects.toThrow('Invalid JSON response');
    });
  });

  describe('error cases', () => {
    it('should throw when fetch is not available', async () => {
      const originalFetch = globalThis.fetch;

      globalThis.fetch = undefined as unknown as typeof fetch;

      try {
        const client = new CoreApiClient();

        await expect(
          client.query({
            companies: { edges: { node: { id: true } } },
          }),
        ).rejects.toThrow('fetch');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('should throw for unrecognized argument names', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch);

      await expect(
        client.mutation({
          createCompany: {
            __args: { unknownArg: 'value' },
            id: true,
          },
        }),
      ).rejects.toThrow(/Cannot infer GraphQL type/);
    });
  });

  describe('headers resolution', () => {
    it('should support static headers object', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch, {
        headers: {
          'X-Custom': 'custom-value',
          Authorization: 'Bearer static',
        },
      });

      await client.query({
        companies: { edges: { node: { id: true } } },
      });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('X-Custom')).toBe('custom-value');
      expect(headers.get('Authorization')).toBe('Bearer static');
    });

    it('should support async headers function', async () => {
      const mockFetch = createMockFetch({});
      const client = createClient(mockFetch, {
        headers: async () => ({
          'X-Dynamic': 'dynamic-value',
        }),
      });

      await client.query({
        companies: { edges: { node: { id: true } } },
      });

      const headers = getSentHeaders(mockFetch);

      expect(headers.get('X-Dynamic')).toBe('dynamic-value');
    });
  });
});
