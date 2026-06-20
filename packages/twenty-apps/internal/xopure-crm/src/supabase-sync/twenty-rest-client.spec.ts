import { describe, expect, it, vi } from 'vitest';

import { createTwentyRestClient } from './twenty-rest-client';
import type { TwentyRestFetch } from './twenty-rest-client';

const jsonResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  text: async () => JSON.stringify(body),
});

const errorResponse = (status: number) => ({
  ok: false,
  status,
  statusText: 'Error',
  text: async () => '',
});

const rateLimitedResponse = (retryAfterSeconds?: number) => ({
  ok: false,
  status: 429,
  statusText: 'Too Many Requests',
  text: async () => '',
  getHeader: (name: string) =>
    name.toLowerCase() === 'retry-after' && retryAfterSeconds !== undefined
      ? String(retryAfterSeconds)
      : null,
});

describe('createTwentyRestClient', () => {
  it('translates supported list queries into Twenty REST filters and connection-shaped results', async () => {
    const fetchImpl = vi.fn<TwentyRestFetch>(async () =>
      jsonResponse([{ id: 'product-1', name: 'Peptide Serum' }]),
    );
    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test/',
      apiKey: 'twenty-api-key',
      fetchImpl,
    });

    const result = await client.query({
      xopureProducts: {
        __args: {
          first: 1,
          filter: {
            supabaseProductId: { eq: 'supabase-product-1' },
          },
        },
        edges: {
          node: {
            id: true,
            name: true,
          },
        },
      },
    });

    const [requestUrl, requestInit] = fetchImpl.mock.calls[0] ?? [];
    const url = new URL(String(requestUrl));

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(url.origin).toBe('https://twenty.example.test');
    expect(url.pathname).toBe('/rest/xopureProducts');
    expect(url.searchParams.get('limit')).toBe('1');
    expect(url.searchParams.get('filter')).toBe(
      'supabaseProductId[eq]:"supabase-product-1"',
    );
    expect(requestInit).toMatchObject({
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer twenty-api-key',
      },
    });
    expect(result).toEqual({
      xopureProducts: {
        edges: [{ node: { id: 'product-1', name: 'Peptide Serum' } }],
      },
    });
  });

  it('translates supported create mutations into Twenty REST POST requests', async () => {
    const fetchImpl = vi.fn<TwentyRestFetch>(async () =>
      jsonResponse({ id: 'product-1', name: 'Peptide Serum' }),
    );
    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'twenty-api-key',
      fetchImpl,
    });

    const result = await client.mutation({
      createXopureProduct: {
        __args: {
          data: {
            name: 'Peptide Serum',
            supabaseProductId: 'supabase-product-1',
          },
        },
        id: true,
      },
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://twenty.example.test/rest/xopureProducts',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer twenty-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Peptide Serum',
          supabaseProductId: 'supabase-product-1',
        }),
      },
    );
    expect(result).toEqual({
      createXopureProduct: { id: 'product-1', name: 'Peptide Serum' },
    });
  });

  it('translates supported update mutations into Twenty REST PATCH requests by id', async () => {
    const fetchImpl = vi.fn<TwentyRestFetch>(async () =>
      jsonResponse({ id: 'product-1' }),
    );
    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'twenty-api-key',
      fetchImpl,
    });

    const result = await client.mutation({
      updateXopureProduct: {
        __args: {
          id: 'product-1',
          data: {
            name: 'Updated Serum',
          },
        },
        id: true,
      },
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://twenty.example.test/rest/xopureProducts/product-1',
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer twenty-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Serum',
        }),
      },
    );
    expect(result).toEqual({
      updateXopureProduct: { id: 'product-1' },
    });
  });

  it('fails unsupported mutation names before calling Twenty REST', async () => {
    const fetchImpl = vi.fn<TwentyRestFetch>();
    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'twenty-api-key',
      fetchImpl,
    });

    await expect(
      client.mutation({
        deleteXopureProduct: {
          __args: {
            id: 'product-1',
          },
        },
      }),
    ).rejects.toThrow('Unsupported Twenty mutation deleteXopureProduct');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('redacts API URL and key from REST failures', async () => {
    const fetchImpl = vi.fn<TwentyRestFetch>(async () => {
      throw new Error(
        'failed to fetch https://twenty.example.test/rest/xopureProducts with secret-key',
      );
    });
    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'secret-key',
      fetchImpl,
    });

    let error: unknown;

    try {
      await client.query({
        xopureProducts: {
          __args: {
            first: 1,
            filter: {
              supabaseProductId: { eq: 'supabase-product-1' },
            },
          },
          edges: {
            node: {
              id: true,
            },
          },
        },
      });
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('Twenty REST request failed');
    expect((error as Error).message).not.toContain('https://twenty.example.test');
    expect((error as Error).message).not.toContain('secret-key');
  });
});

describe('createTwentyRestClient — request delay', () => {
  it('waits requestDelayMs before each request', async () => {
    const fetchImpl = vi.fn<TwentyRestFetch>(async () =>
      jsonResponse([{ id: 'p1' }]),
    );
    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'key',
      fetchImpl,
      requestDelayMs: 50,
    });

    const start = Date.now();
    await client.query({
      xopureProducts: {
        __args: { first: 1, filter: { id: { eq: 'x' } } },
        edges: { node: { id: true } },
      },
    });
    const elapsed = Date.now() - start;

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });

  it('does not delay when requestDelayMs is unset', async () => {
    const fetchImpl = vi.fn<TwentyRestFetch>(async () =>
      jsonResponse([{ id: 'p1' }]),
    );
    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'key',
      fetchImpl,
    });

    const start = Date.now();
    await client.query({
      xopureProducts: {
        __args: { first: 1, filter: { id: { eq: 'x' } } },
        edges: { node: { id: true } },
      },
    });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(40);
  });
});

describe('createTwentyRestClient — 429 retry with exponential backoff', () => {
  it('retries on 429 up to maxRetries times then succeeds', async () => {
    const fetchImpl = vi
      .fn<TwentyRestFetch>()
      .mockResolvedValueOnce(errorResponse(429))
      .mockResolvedValueOnce(errorResponse(429))
      .mockResolvedValueOnce(jsonResponse([{ id: 'p1' }]));

    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'key',
      fetchImpl,
      maxRetries: 3,
      retryBaseDelayMs: 10,
    });

    const result = await client.query({
      xopureProducts: {
        __args: { first: 1, filter: { id: { eq: 'x' } } },
        edges: { node: { id: true } },
      },
    });

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(result).toHaveProperty('xopureProducts');
  });

  it('throws after exhausting all retries on persistent 429', async () => {
    const fetchImpl = vi
      .fn<TwentyRestFetch>()
      .mockResolvedValue(errorResponse(429));

    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'key',
      fetchImpl,
      maxRetries: 2,
      retryBaseDelayMs: 10,
    });

    await expect(
      client.query({
        xopureProducts: {
          __args: { first: 1, filter: { id: { eq: 'x' } } },
          edges: { node: { id: true } },
        },
      }),
    ).rejects.toThrow('after 2 retries');

    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-429 errors', async () => {
    const fetchImpl = vi
      .fn<TwentyRestFetch>()
      .mockResolvedValue(errorResponse(500));

    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'key',
      fetchImpl,
      maxRetries: 5,
      retryBaseDelayMs: 10,
    });

    await expect(
      client.query({
        xopureProducts: {
          __args: { first: 1, filter: { id: { eq: 'x' } } },
          edges: { node: { id: true } },
        },
      }),
    ).rejects.toThrow('status 500');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not retry when maxRetries is 0', async () => {
    const fetchImpl = vi
      .fn<TwentyRestFetch>()
      .mockResolvedValue(errorResponse(429));

    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'key',
      fetchImpl,
    });

    await expect(
      client.query({
        xopureProducts: {
          __args: { first: 1, filter: { id: { eq: 'x' } } },
          edges: { node: { id: true } },
        },
      }),
    ).rejects.toThrow('status 429');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('honors Retry-After header when present on 429', async () => {
    const fetchImpl = vi
      .fn<TwentyRestFetch>()
      .mockResolvedValueOnce(rateLimitedResponse(1))
      .mockResolvedValueOnce(jsonResponse([{ id: 'p1' }]));

    const client = createTwentyRestClient({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'key',
      fetchImpl,
      maxRetries: 1,
      retryBaseDelayMs: 5000,
    });

    const start = Date.now();
    const result = await client.query({
      xopureProducts: {
        __args: { first: 1, filter: { id: { eq: 'x' } } },
        edges: { node: { id: true } },
      },
    });
    const elapsed = Date.now() - start;

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result).toHaveProperty('xopureProducts');
    // Retry-After: 1 means ~1000ms wait, not 5000ms exponential
    expect(elapsed).toBeLessThan(3000);
  });
});
