import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { postPdlBulkEnrich } from 'src/logic-functions/utils/post-pdl-enrich';

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

describe('postPdlBulkEnrich', () => {
  beforeEach(() => {
    process.env.PDL_API_KEY = 'secret-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PDL_API_KEY;
  });

  it('sends one request wrapping every record under requests[].params', async () => {
    const fetchMock = stubFetch(buildResponse(200, [{ status: 200, data: {} }]));

    await postPdlBulkEnrich({ path: '/person/bulk', requests: [{ email: 'a@b.com' }] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.peopledatalabs.com/v5/person/bulk');
    expect(JSON.parse(init.body as string)).toEqual({
      requests: [{ params: { email: 'a@b.com' } }],
    });
  });

  it('maps each response item to its aligned outcome', async () => {
    stubFetch(
      buildResponse(200, [
        { status: 200, likelihood: 8, data: { id: 'a' } },
        { status: 404 },
        { status: 500, error: { message: 'boom' } },
      ]),
    );

    const results = await postPdlBulkEnrich({
      path: '/person/bulk',
      requests: [
        { email: 'a@b.com' },
        { email: 'b@b.com' },
        { email: 'c@b.com' },
      ],
    });

    expect(results).toEqual([
      { outcome: 'matched', httpStatus: 200, likelihood: 8, data: { id: 'a' } },
      { outcome: 'not_found', httpStatus: 404 },
      { outcome: 'error', httpStatus: 500, message: 'boom' },
    ]);
  });

  it('treats a 200 item without a data envelope as not_found', async () => {
    stubFetch(buildResponse(200, [{ status: 200, name: 'Acme' }]));

    const results = await postPdlBulkEnrich({
      path: '/company/enrich/bulk',
      requests: [{ name: 'Acme' }],
    });

    expect(results[0]).toEqual({ outcome: 'not_found', httpStatus: 200 });
  });

  it('reads the responses envelope when the body is not a bare array', async () => {
    stubFetch(
      buildResponse(200, { responses: [{ status: 200, data: { id: 'a' } }] }),
    );

    const results = await postPdlBulkEnrich({
      path: '/person/bulk',
      requests: [{ email: 'a@b.com' }],
    });

    expect(results[0]).toMatchObject({ outcome: 'matched', data: { id: 'a' } });
  });

  it('fails the whole batch when the result count does not match the request count', async () => {
    stubFetch(buildResponse(200, [{ status: 200, data: { id: 'a' } }]));

    const results = await postPdlBulkEnrich({
      path: '/person/bulk',
      requests: [{ email: 'a@b.com' }, { email: 'b@b.com' }],
    });

    expect(results).toEqual([
      {
        outcome: 'error',
        httpStatus: 200,
        message:
          'People Data Labs returned 1 results for 2 requests (HTTP 200).',
      },
      {
        outcome: 'error',
        httpStatus: 200,
        message:
          'People Data Labs returned 1 results for 2 requests (HTTP 200).',
      },
    ]);
  });

  it('fails every record when the whole call is a non-2xx response', async () => {
    stubFetch(buildResponse(401, { error: { message: 'unauthorized' } }));

    const results = await postPdlBulkEnrich({
      path: '/person/bulk',
      requests: [{ email: 'a@b.com' }, { email: 'b@b.com' }],
    });

    expect(results).toEqual([
      { outcome: 'error', httpStatus: 401, message: 'unauthorized' },
      { outcome: 'error', httpStatus: 401, message: 'unauthorized' },
    ]);
  });

  it('fails every record when fetch throws', async () => {
    stubFetch(new Error('network down'));

    const results = await postPdlBulkEnrich({
      path: '/person/bulk',
      requests: [{ email: 'a@b.com' }],
    });

    expect(results).toEqual([
      {
        outcome: 'error',
        httpStatus: 0,
        message: 'PDL request failed: network down',
      },
    ]);
  });

  it('fails every record on a non-JSON response', async () => {
    stubFetch(buildResponse(200, null, true));

    const results = await postPdlBulkEnrich({
      path: '/person/bulk',
      requests: [{ email: 'a@b.com' }],
    });

    expect(results).toEqual([
      {
        outcome: 'error',
        httpStatus: 200,
        message: 'PDL returned a non-JSON response (HTTP 200).',
      },
    ]);
  });

  it('returns an empty array without calling fetch for no records', async () => {
    const fetchMock = stubFetch(buildResponse(200, []));

    expect(await postPdlBulkEnrich({ path: '/person/bulk', requests: [] })).toEqual(
      [],
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
