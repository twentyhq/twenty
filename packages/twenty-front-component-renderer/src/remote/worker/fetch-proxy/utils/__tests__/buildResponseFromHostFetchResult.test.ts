import { buildResponseFromHostFetchResult } from '../buildResponseFromHostFetchResult';

class StubResponse {
  body: string | null;
  status: number;
  statusText: string;
  headers: Headers;

  constructor(
    body: string | null,
    init?: {
      status?: number;
      statusText?: string;
      headers?: Record<string, string>;
    },
  ) {
    this.body = body;
    this.status = init?.status ?? 200;
    this.statusText = init?.statusText ?? '';
    this.headers = new Headers(init?.headers);
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  async text() {
    return this.body ?? '';
  }
}

const originalResponse = (globalThis as { Response?: unknown }).Response;

describe('buildResponseFromHostFetchResult', () => {
  beforeAll(() => {
    (globalThis as { Response?: unknown }).Response = StubResponse;
  });

  afterAll(() => {
    (globalThis as { Response?: unknown }).Response = originalResponse;
  });

  it('should rebuild a response carrying the host fetch result fields', async () => {
    const response = buildResponseFromHostFetchResult({
      status: 201,
      statusText: 'Created',
      headers: { 'content-type': 'application/json' },
      body: 'proxied',
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);
    expect(response.statusText).toBe('Created');
    expect(response.headers.get('content-type')).toBe('application/json');
    await expect(response.text()).resolves.toBe('proxied');
  });

  it('should mark error statuses as not ok', () => {
    const response = buildResponseFromHostFetchResult({
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      body: '',
    });

    expect(response.ok).toBe(false);
  });

  it('should drop the body for null body statuses', () => {
    for (const status of [204, 205, 304]) {
      const response = buildResponseFromHostFetchResult({
        status,
        statusText: '',
        headers: {},
        body: '',
      });

      expect(response.body).toBeNull();
    }
  });
});
