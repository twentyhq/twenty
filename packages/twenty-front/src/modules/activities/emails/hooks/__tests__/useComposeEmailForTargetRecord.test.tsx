import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const mockOpenComposeEmailInSidePanel = jest.fn();

jest.mock('@/side-panel/hooks/useOpenComposeEmailInSidePanel', () => ({
  useOpenComposeEmailInSidePanel: () => ({
    openComposeEmailInSidePanel: mockOpenComposeEmailInSidePanel,
  }),
}));
jest.mock('@/activities/emails/hooks/useResolveDefaultEmailRecipient', () => ({
  useResolveDefaultEmailRecipient: () => ({
    defaultTo: 'lead@example.com',
    loading: false,
  }),
}));
jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => jest.fn(),
}));

const buildAccount = (id: string, handle: string) => ({
  id,
  handle,
  handleAliases: null,
  provider: ConnectedAccountProvider.GOOGLE,
  connectionParameters: null,
  archivedAt: null,
});

describe('useComposeEmailForTargetRecord', () => {
  it('starts a new email on the default sender', () => {
    const store = createStore();
    store.set(myConnectedAccountsState.atom, [
      buildAccount('personal-account', 'person@gmail.com'),
      buildAccount('domain-account', 'ops@example.com'),
    ] as never);
    store.set(currentWorkspaceState.atom, {
      defaultSenderDomain: 'example.com',
    } as never);
    store.set(currentUserWorkspaceState.atom, {
      defaultFromHandle: null,
    } as never);

    const { result } = renderHook(
      () =>
        useComposeEmailForTargetRecord({
          id: 'person-id',
          targetObjectNameSingular: 'person',
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        ),
      },
    );

    act(() => result.current.openComposer());

    expect(mockOpenComposeEmailInSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: 'domain-account',
        initialFromHandle: 'ops@example.com',
      }),
    );
  });
});
