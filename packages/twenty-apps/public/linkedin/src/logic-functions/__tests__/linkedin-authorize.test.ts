import { afterEach, describe, expect, it, vi } from 'vitest';

import { linkedinAuthorizeHandler } from 'src/logic-functions/linkedin-authorize';
import { decodeLinkedinConnectFlow } from 'src/logic-functions/utils/decode-linkedin-connect-flow.util';

const CALLBACK_URL =
  'https://api.twenty.com/auth/apps/custom/callback?state=signed.state';

const authorize = () =>
  linkedinAuthorizeHandler({
    connectionProviderId: 'provider-id',
    connectionProviderName: 'linkedin',
    callbackUrl: CALLBACK_URL,
  });

describe('linkedinAuthorizeHandler', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends the member to the connect page with a flow bound to this connection', async () => {
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.withtwenty.com');

    const authorizationUrl = new URL((await authorize()).authorizationUrl);

    expect(`${authorizationUrl.origin}${authorizationUrl.pathname}`).toBe(
      'https://acme.withtwenty.com/linkedin/connect',
    );
    expect(
      decodeLinkedinConnectFlow(
        authorizationUrl.searchParams.get('flow') ?? undefined,
      ),
    ).toMatchObject({ callbackUrl: CALLBACK_URL, pendingCheckpoint: null });
  });

  it('serves the connect page from the server when no functions domain is set', async () => {
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
    vi.stubEnv('TWENTY_FUNCTIONS_URL', '');
    vi.stubEnv('TWENTY_API_URL', 'https://crm.example.com');

    expect((await authorize()).authorizationUrl).toMatch(
      /^https:\/\/crm\.example\.com\/s\/linkedin\/connect\?flow=/,
    );
  });
});
