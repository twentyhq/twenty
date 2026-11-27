import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ createAuthLink: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileHostedAuth: class {
    createAuthLink = mocks.createAuthLink;
  },
}));

const { whatsappAuthorizeHandler } =
  await import('src/logic-functions/whatsapp-authorize');

describe('whatsappAuthorizeHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
    mocks.createAuthLink.mockResolvedValue({
      data: { link: 'https://account.unipile.com/qr-page' },
    });
  });

  it('sends the member to a page that only offers the WhatsApp QR code', async () => {
    await expect(
      whatsappAuthorizeHandler({
        connectionProviderId: 'provider-id',
        connectionProviderName: 'whatsapp',
        callbackUrl: 'https://twenty.example/apps/callback?state=signed-state',
      }),
    ).resolves.toEqual({
      authorizationUrl: 'https://account.unipile.com/qr-page',
    });

    const { body } = mocks.createAuthLink.mock.calls[0][0];

    expect(body).toMatchObject({
      providers: ['whatsapp'],
      redirect_uri: 'https://twenty.example/apps/callback?state=signed-state',
      config: { whatsapp: { allow_methods: ['qr'] } },
    });
    expect(body).not.toHaveProperty('state');
  });
});
