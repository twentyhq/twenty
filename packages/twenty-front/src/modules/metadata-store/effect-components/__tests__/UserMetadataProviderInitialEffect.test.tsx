import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { UserMetadataProviderInitialEffect } from '@/metadata-store/effect-components/UserMetadataProviderInitialEffect';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

jest.mock('@/auth/hooks/useIsLogged', () => ({
  useIsLogged: () => true,
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    data: {
      currentUser: {
        id: 'user-id',
        currentUserWorkspace: {
          permissionFlags: [],
          twoFactorAuthenticationMethodSummary: [],
          objectsPermissions: [],
          isImpersonating: false,
          defaultFromHandle: 'me@acme.com',
        },
        currentWorkspace: {
          id: 'workspace-id',
          defaultSenderDomain: 'acme.com',
        },
      },
    },
  }),
}));

jest.mock('@/localization/hooks/useInitializeFormatPreferences', () => ({
  useInitializeFormatPreferences: () => ({
    initializeFormatPreferences: jest.fn(),
  }),
}));

jest.mock('~/utils/i18n/dynamicActivate', () => ({
  dynamicActivate: jest.fn(),
}));

describe('UserMetadataProviderInitialEffect', () => {
  it('hydrates the default From handle and default sender domain', async () => {
    render(
      <JotaiProvider store={jotaiStore}>
        <UserMetadataProviderInitialEffect />
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(
        jotaiStore.get(currentUserWorkspaceState.atom)?.defaultFromHandle,
      ).toBe('me@acme.com');
    });
    expect(
      jotaiStore.get(currentWorkspaceState.atom)?.defaultSenderDomain,
    ).toBe('acme.com');
  });
});
