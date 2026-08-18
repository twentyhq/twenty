import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { postPdlSingleEnrich } from 'src/logic-functions/utils/post-pdl-single-enrich';

type FetchResponse = {
  status: number;
  ok: boolean;
  json: () => Promise<unknown>;
};

const buildResponse = (
  status: number,
  json: unknown,
  jsonThrows = false,
): FetchResponse => ({
  status,
  ok: status >= 200 && status < 300,
  json: () =>
    jsonThrows ? Promise.reject(new Error('invalid json')) : Promise.resolve(json),
});

const stubFetch = (response: FetchResponse | Error) => {
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response),
  );
  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

describe('postPdlSingleEnrich', () => {
  beforeEach(() => {
    process.env.PDL_API_KEY = 'secret-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PDL_API_KEY;
  });

  it('posts the params directly in the body (not wrapped under requests)', async () => {
    const fetchMock = stubFetch(buildResponse(200, { status: 200, data: {} }));

    await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.peopledatalabs.com/v5/person/enrich');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'a@b.com' });
  });

  it('maps a 200 person match with a data envelope', async () => {
    stubFetch(
      buildResponse(200, { status: 200, likelihood: 8, data: { id: 'a' } }),
    );

    const result = await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });

    expect(result).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: { id: 'a' },
    });
  });

  it('maps a 200 company match whose fields are at the top level', async () => {
    stubFetch(
      buildResponse(200, { status: 200, likelihood: 6, id: 'c1', name: 'Acme' }),
    );

    const result = await postPdlSingleEnrich({
      path: '/company/enrich',
      params: { name: 'Acme' },
    });

    expect(result).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 6,
      data: { id: 'c1', name: 'Acme' },
    });
  });

  it('treats a 404 no-match as not_found from the body status', async () => {
    stubFetch(buildResponse(404, { status: 404, error: { message: 'no match' } }));

    const result = await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });

    expect(result).toEqual({ outcome: 'not_found', httpStatus: 404 });
  });

  it('falls back to the HTTP status when the body omits status', async () => {
    stubFetch(buildResponse(404, { error: { message: 'no match' } }));

    const result = await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });

    expect(result).toEqual({ outcome: 'not_found', httpStatus: 404 });
  });

  it('reports an error on a non-2xx response with an error body', async () => {
    stubFetch(buildResponse(401, { status: 401, error: { message: 'unauthorized' } }));

    const result = await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });

    expect(result).toEqual({
      outcome: 'error',
      httpStatus: 401,
      message: 'unauthorized',
    });
  });

  it('reports an error when fetch throws', async () => {
    stubFetch(new Error('network down'));

    const result = await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });

    expect(result).toEqual({
      outcome: 'error',
      httpStatus: 0,
      message: 'PDL request failed: network down',
    });
  });

  it('reports an error on a non-JSON response', async () => {
    stubFetch(buildResponse(200, null, true));

    const result = await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });

    expect(result).toEqual({
      outcome: 'error',
      httpStatus: 200,
      message: 'PDL returned a non-JSON response (HTTP 200).',
    });
  });

  it('drops a match below the requested min_likelihood', async () => {
    stubFetch(
      buildResponse(200, { status: 200, likelihood: 3, data: { id: 'a' } }),
    );

    const result = await postPdlSingleEnrich({
      path: '/person/enrich',
      params: { email: 'a@b.com', min_likelihood: 6 },
    });

    expect(result).toEqual({ outcome: 'not_found', httpStatus: 200 });
  });
});
