import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createAuthLink: vi.fn(),
  getOrCreateUnipileWorkspaceScopeId: vi.fn(),
}));

vi.mock('@unipile/sdk', () => ({
  UnipileHostedAuth: class {
    createAuthLink = mocks.createAuthLink;
  },
}));

vi.mock(
  'src/unipile/utils/get-or-create-unipile-workspace-scope-id.util',
  () => ({
    getOrCreateUnipileWorkspaceScopeId:
      mocks.getOrCreateUnipileWorkspaceScopeId,
  }),
);

const { linkedinAuthorizeHandler } =
  await import('src/logic-functions/linkedin-authorize');

describe('linkedinAuthorizeHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
    mocks.getOrCreateUnipileWorkspaceScopeId.mockResolvedValue('scp_workspace');
    mocks.createAuthLink.mockResolvedValue({
      data: { link: 'https://account.unipile.com/linkedin-page' },
    });
  });

  it('sends the member to a page that connects LinkedIn and comes back with the connection state', async () => {
    await expect(
      linkedinAuthorizeHandler(
        {
          connectionProviderId: 'provider-id',
          connectionProviderName: 'linkedin',
          callbackUrl:
            'https://twenty.example/apps/callback?state=signed-state',
        },
        { workspaceId: 'workspace-id' },
      ),
    ).resolves.toEqual({
      authorizationUrl: 'https://account.unipile.com/linkedin-page',
    });

    const { body } = mocks.createAuthLink.mock.calls[0][0];

    expect(body).toMatchObject({
      providers: ['linkedin'],
      redirect_uri: 'https://twenty.example/apps/callback?state=signed-state',
      account_scope_id: 'scp_workspace',
    });
    expect(body).not.toHaveProperty('state');
    expect(mocks.getOrCreateUnipileWorkspaceScopeId).toHaveBeenCalledWith(
      'workspace-id',
    );
  });
});
