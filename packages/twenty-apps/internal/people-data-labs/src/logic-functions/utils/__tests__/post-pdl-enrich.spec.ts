import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { postPdlEnrich } from 'src/logic-functions/utils/post-pdl-enrich';

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

describe('postPdlEnrich', () => {
  beforeEach(() => {
    process.env.PDL_API_KEY = 'secret-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PDL_API_KEY;
  });

  it('returns a matched outcome with data and likelihood on 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(buildResponse(200, { likelihood: 8, data: { id: 'x' } })),
      ),
    );

    const result = await postPdlEnrich('/person/enrich', { email: 'a@b.com' });

    expect(result).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: { id: 'x' },
    });
  });

  it('uses the whole body as data when there is no data envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(buildResponse(200, { id: 'company-1' }))),
    );

    const result = await postPdlEnrich('/company/enrich', { name: 'Acme' });

    expect(result).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: undefined,
      data: { id: 'company-1' },
    });
  });

  it('returns a not_found outcome on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(buildResponse(404, {}))),
    );

    const result = await postPdlEnrich('/person/enrich', {});

    expect(result).toEqual({ outcome: 'not_found', httpStatus: 404 });
  });

  it('returns an error outcome with the PDL error message on a non-2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(buildResponse(500, { error: { message: 'boom' } })),
      ),
    );

    const result = await postPdlEnrich('/person/enrich', {});

    expect(result).toEqual({ outcome: 'error', httpStatus: 500, message: 'boom' });
  });

  it('returns an error outcome when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down'))),
    );

    const result = await postPdlEnrich('/person/enrich', {});

    expect(result).toEqual({
      outcome: 'error',
      httpStatus: 0,
      message: 'PDL request failed: network down',
    });
  });

  it('returns an error outcome on a non-JSON response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(buildResponse(200, null, true))),
    );

    const result = await postPdlEnrich('/person/enrich', {});

    expect(result).toEqual({
      outcome: 'error',
      httpStatus: 200,
      message: 'PDL returned a non-JSON response (HTTP 200).',
    });
  });
});
