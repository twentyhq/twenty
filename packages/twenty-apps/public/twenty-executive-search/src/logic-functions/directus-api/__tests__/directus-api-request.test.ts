import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { directusApiRequest } from 'src/logic-functions/directus-api/directus-api-request.util';
import { type DirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';

const DIRECTUS_API_CONFIG: DirectusApiConfig = {
  url: 'https://directus.firm.example',
  apiKey: 'directus-api-key',
};

describe('directusApiRequest', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a GET request with Bearer authorization', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 1, name: 'Test' }] }),
    });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection',
      method: 'GET',
    });

    expect(result).toEqual({
      ok: true,
      status: 200,
      data: { data: [{ id: 1, name: 'Test' }] },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.firm.example/items/test_collection',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer directus-api-key',
        }),
      }),
    );
  });

  it('sends a POST request with JSON body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 42 }),
    });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection',
      method: 'POST',
      body: { name: 'New Item' },
    });

    expect(result).toEqual({ ok: true, status: 201, data: { id: 42 } });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.firm.example/items/test_collection',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ name: 'New Item' }),
      }),
    );
  });

  it('returns 204 as ok with undefined data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection/42',
      method: 'DELETE',
    });

    expect(result).toEqual({ ok: true, status: 204, data: undefined });
  });

  it('returns ok with undefined data for 404 when allowNotFound is true', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: 'Not found' } }),
    });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection/999',
      method: 'GET',
      allowNotFound: true,
    });

    expect(result).toEqual({ ok: true, status: 404, data: undefined });
  });

  it('retries on 5xx status and eventually succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: { message: 'Service Unavailable' } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({ error: { message: 'Bad Gateway' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection',
      method: 'GET',
    });

    expect(result).toEqual({ ok: true, status: 200, data: { data: 'success' } });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('surfaces the error on 4xx status without retrying', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ errors: [{ message: 'Validation failed' }] }),
    });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection',
      method: 'POST',
      body: { invalid: 'data' },
    });

    expect(result).toEqual({
      ok: false,
      status: 422,
      errorMessage:
        'Directus API responded with HTTP 422: {"errors":[{"message":"Validation failed"}]}',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 (rate limited) and eventually succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Too Many Requests' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'retried' }),
      });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection',
      method: 'GET',
    });

    expect(result).toEqual({ ok: true, status: 200, data: { data: 'retried' } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports a network error as retryable with a failed result', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'));

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection',
      method: 'GET',
      maxAttempts: 1,
    });

    expect(result).toEqual({
      ok: false,
      status: null,
      errorMessage: 'Directus API request failed: Network failure',
    });
  });

  it('stops retrying after maxAttempts', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: { message: 'Still down' } }),
    });

    const result = await directusApiRequest({
      config: DIRECTUS_API_CONFIG,
      path: '/items/test_collection',
      method: 'GET',
      maxAttempts: 2,
    });

    expect(result.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
