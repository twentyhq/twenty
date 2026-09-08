import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { claimSummaryGeneration } from 'src/logic-functions/data/claim-summary-generation.util';

const fetchMock = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'user-token');
  vi.stubEnv('TWENTY_API_URL', 'https://twenty.test');
  vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'test-token');
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it.each([true, false])(
  'uses the atomic workspace claim result: %s',
  async (claimed) => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ data: { setAppKeyValueIfAbsent: claimed } }),
    });
    expect(await claimSummaryGeneration('summary-key')).toBe(claimed);
    expect(
      new Headers(fetchMock.mock.calls[0][1].headers).get('Authorization'),
    ).toBe('Bearer test-token');
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.variables.input).toMatchObject({
      key: 'summary-key',
      value: { status: 'RUNNING' },
      scope: 'WORKSPACE',
    });
  },
);

it.each([{ errors: [{ message: 'Unavailable' }] }, { data: {} }, {}])(
  'fails closed when a claim was not acknowledged: %j',
  async (body) => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(body),
    });
    await expect(claimSummaryGeneration('summary-key')).rejects.toThrow(
      'not acknowledged',
    );
  },
);

it('propagates transport failures without granting a claim', async () => {
  fetchMock.mockRejectedValue(new Error('network unavailable'));
  await expect(claimSummaryGeneration('summary-key')).rejects.toThrow(
    'network unavailable',
  );
});
