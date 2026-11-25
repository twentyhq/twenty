import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { linkedinConnectPageHandler } from 'src/logic-functions/linkedin-connect-page';
import { encodeLinkedinConnectFlow } from 'src/logic-functions/utils/encode-linkedin-connect-flow.util';

describe('linkedinConnectPageHandler', () => {
  beforeEach(() => {
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('serves the sign-in form of a flow this app signed', async () => {
    const response = await linkedinConnectPageHandler({
      queryStringParameters: {
        flow: encodeLinkedinConnectFlow({
          callbackUrl: 'https://api.twenty.com/callback?state=signed',
          expiresAtMs: Date.now() + 60_000,
          pendingCheckpoint: null,
        }),
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers).toMatchObject({
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    });
    expect(response.body).toContain('name="password"');
  });

  it('refuses a link this app did not sign', async () => {
    const response = await linkedinConnectPageHandler({
      queryStringParameters: { flow: 'forged.flow' },
    });

    expect(response.status).toBe(400);
    expect(response.body).toContain('This sign-in link has expired');
    expect(response.body).not.toContain('name="password"');
  });
});
