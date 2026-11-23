import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createUnipileHostedAuthLink } from 'src/unipile/utils/create-unipile-hosted-auth-link.util';

const createAuthLink = vi.hoisted(() => vi.fn());

vi.mock('@unipile/sdk', () => ({
  UnipileHostedAuth: class {
    createAuthLink = createAuthLink;
  },
}));

const CALLBACK_URL = 'https://twenty.example.com/apps/oauth/callback?state=abc';

describe('createUnipileHostedAuthLink', () => {
  beforeEach(() => {
    vi.stubEnv('UNIPILE_API_KEY', 'api-key');
    createAuthLink.mockResolvedValue({
      data: { link: 'https://auth.unipile.com/session' },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('should keep the default Unipile domain when no custom domain is set', async () => {
    const link = await createUnipileHostedAuthLink({
      provider: 'linkedin',
      callbackUrl: CALLBACK_URL,
    });

    expect(link).toBe('https://auth.unipile.com/session');
    expect(createAuthLink.mock.calls[0][0].body).not.toHaveProperty('domain');
  });

  it('should ask for the custom domain when one is set', async () => {
    vi.stubEnv('UNIPILE_HOSTED_AUTH_DOMAIN', 'auth.example.com');

    await createUnipileHostedAuthLink({
      provider: 'linkedin',
      callbackUrl: CALLBACK_URL,
    });

    expect(createAuthLink.mock.calls[0][0].body).toMatchObject({
      providers: ['linkedin'],
      domain: 'auth.example.com',
    });
  });
});
