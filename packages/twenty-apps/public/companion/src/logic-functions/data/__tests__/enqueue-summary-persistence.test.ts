import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { enqueueSummaryPersistence } from 'src/logic-functions/data/enqueue-summary-persistence.util';

const fetchMock = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'user-token');
  vi.stubEnv('TWENTY_API_URL', 'https://twenty.test');
  vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'application-token');
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it('sends the paid output using application-scoped authentication', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    text: async () => JSON.stringify({ data: { enqueueAppKeyValue: true } }),
  });
  const value = { status: 'READY', markdown: 'Paid output' };
  await enqueueSummaryPersistence('summary-key', value);
  const [url, request] = fetchMock.mock.calls[0];
  expect(url).toBe('https://twenty.test/metadata');
  expect(new Headers(request.headers).get('Authorization')).toBe(
    'Bearer application-token',
  );
  expect(JSON.parse(request.body).variables.input).toEqual({
    key: 'summary-key',
    value,
    scope: 'WORKSPACE',
  });
});

it.each([
  { data: { enqueueAppKeyValue: false } },
  { errors: [{ message: 'Unavailable' }] },
  {},
])('requires explicit queue acknowledgment: %j', async (body) => {
  fetchMock.mockResolvedValue({
    ok: true,
    text: async () => JSON.stringify(body),
  });
  await expect(enqueueSummaryPersistence('summary-key', {})).rejects.toThrow(
    'not acknowledged',
  );
});

it('propagates transport failure', async () => {
  fetchMock.mockRejectedValue(new Error('Network unavailable'));
  await expect(enqueueSummaryPersistence('summary-key', {})).rejects.toThrow(
    'Network unavailable',
  );
});
