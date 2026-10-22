import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const mockQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query: mockQuery }),
}));

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace', () => ({
  useIsCurrentLocationOnAWorkspace: () => ({ isOnAWorkspace: false }),
}));

jest.mock('@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain', () => ({
  useLastAuthenticatedWorkspaceDomain: () => ({
    setLastAuthenticateWorkspaceDomain: jest.fn(),
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

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useLoadCurrentUser', () => {
  it('hydrates the default From handle and default sender domain', async () => {
    mockQuery.mockResolvedValue({
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
            workspaceUrls: {},
            defaultSenderDomain: 'acme.com',
          },
        },
      },
    });

    const { result } = renderHook(() => useLoadCurrentUser(), { wrapper });

    await act(async () => {
      await result.current.loadCurrentUser();
    });

    expect(
      jotaiStore.get(currentUserWorkspaceState.atom)?.defaultFromHandle,
    ).toBe('me@acme.com');
    expect(
      jotaiStore.get(currentWorkspaceState.atom)?.defaultSenderDomain,
    ).toBe('acme.com');
  });
});
