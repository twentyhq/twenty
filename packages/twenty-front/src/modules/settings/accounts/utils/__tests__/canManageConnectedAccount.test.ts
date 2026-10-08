import { canManageConnectedAccount } from '@/settings/accounts/utils/canManageConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';

describe('canManageConnectedAccount', () => {
  const defaults = {
    userWorkspaceId: 'me',
    canManageWorkspace: false,
    canManageApplications: false,
  };

  it.each([ConnectedAccountProvider.GOOGLE, ConnectedAccountProvider.APP])(
    'allows managing the caller’s own %s connection',
    (provider) => {
      expect(
        canManageConnectedAccount({
          ...defaults,
          account: { provider, userWorkspaceId: 'me', visibility: 'user' },
        }),
      ).toBe(true);
    },
  );

  it.each([ConnectedAccountProvider.GOOGLE, ConnectedAccountProvider.APP])(
    'never authorizes another member’s private %s connection through email grouping or admin flags',
    (provider) => {
      expect(
        canManageConnectedAccount({
          ...defaults,
          canManageWorkspace: true,
          canManageApplications: true,
          account: { provider, userWorkspaceId: 'other', visibility: 'user' },
        }),
      ).toBe(false);
    },
  );

  it('uses the distinct native and application administration permissions for shared records', () => {
    const native = {
      provider: ConnectedAccountProvider.GOOGLE,
      userWorkspaceId: 'other',
      visibility: 'workspace',
    };
    const application = { ...native, provider: ConnectedAccountProvider.APP };

    expect(canManageConnectedAccount({ ...defaults, account: native })).toBe(
      false,
    );
    expect(
      canManageConnectedAccount({ ...defaults, account: application }),
    ).toBe(false);
    expect(
      canManageConnectedAccount({
        ...defaults,
        canManageWorkspace: true,
        account: native,
      }),
    ).toBe(true);
    expect(
      canManageConnectedAccount({
        ...defaults,
        canManageWorkspace: true,
        account: application,
      }),
    ).toBe(false);
    expect(
      canManageConnectedAccount({
        ...defaults,
        canManageApplications: true,
        account: native,
      }),
    ).toBe(false);
    expect(
      canManageConnectedAccount({
        ...defaults,
        canManageApplications: true,
        account: application,
      }),
    ).toBe(true);
  });

  it('does not infer ownership from missing userWorkspace IDs', () => {
    expect(
      canManageConnectedAccount({
        ...defaults,
        userWorkspaceId: undefined,
        account: {
          provider: ConnectedAccountProvider.APP,
          userWorkspaceId: 'me',
          visibility: 'user',
        },
      }),
    ).toBe(false);
  });
});
