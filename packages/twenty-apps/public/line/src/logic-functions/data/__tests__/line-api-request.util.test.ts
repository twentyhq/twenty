import { isObject } from '@sniptt/guards';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';

const stubLineResponse = (body: unknown, status = 200) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );

const isBotInfo = (body: unknown): body is { userId: string } =>
  isObject(body) && 'userId' in body;

const requestBotInfo = () =>
  lineApiRequest({
    accessToken: 'token',
    method: 'GET',
    path: '/v2/bot/info',
    isExpectedResponse: isBotInfo,
  });

describe('lineApiRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a response of the expected shape', async () => {
    stubLineResponse({ userId: 'U1' });

    expect(await requestBotInfo()).toEqual({ userId: 'U1' });
  });

  it('refuses a response of another shape', async () => {
    stubLineResponse({ unexpected: true });

    await expect(requestBotInfo()).rejects.toThrow('unexpected response');
  });

  it('reports the status and LINE message of a failed request', async () => {
    stubLineResponse({ message: 'Authentication failed' }, 401);

    const error = await requestBotInfo().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(LineApiError);
    expect(error).toMatchObject({ status: 401 });
    expect(String(error)).toContain('Authentication failed');
  });
});
