import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { SettingsAccountsDefaultFromHandleSection } from '@/settings/accounts/components/SettingsAccountsDefaultFromHandleSection';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const mockUpdateMyDefaultFromHandle = jest.fn();

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockUpdateMyDefaultFromHandle, { loading: false }],
}));

const renderSection = (
  defaultFromHandle: string | null,
  hasSendableAccount = true,
) => {
  const store = createStore();
  store.set(
    myConnectedAccountsState.atom,
    hasSendableAccount
      ? ([
          {
            id: 'account-id',
            handle: 'me@example.com',
            provider: ConnectedAccountProvider.GOOGLE,
            handleAliases: ['alias@example.com'],
            scopes: ['https://www.googleapis.com/auth/gmail.send'],
            connectionParameters: null,
            archivedAt: null,
          },
          {
            id: 'archived-account-id',
            handle: 'old@example.com',
            provider: ConnectedAccountProvider.GOOGLE,
            handleAliases: [],
            scopes: ['https://www.googleapis.com/auth/gmail.send'],
            connectionParameters: null,
            archivedAt: '2026-01-01T00:00:00.000Z',
          },
        ] as never)
      : [],
  );
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: [],
    objectsPermissions: [],
    defaultFromHandle,
  } as never);

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <SettingsAccountsDefaultFromHandleSection />
      </I18nProvider>
    </Provider>,
  );

  return store;
};

describe('SettingsAccountsDefaultFromHandleSection', () => {
  beforeEach(() => {
    mockUpdateMyDefaultFromHandle.mockReset();
    mockUpdateMyDefaultFromHandle.mockResolvedValue({
      data: { updateMyDefaultFromHandle: true },
    });
  });

  it('renders nothing without a sendable account', () => {
    renderSection(null, false);

    expect(screen.queryByText('My default From address')).toBeNull();
  });

  it('renders for a sendable account regardless of channel sync', () => {
    renderSection(null);

    expect(screen.getByText('My default From address')).toBeVisible();
  });

  it('offers automatic plus each sendable handle', async () => {
    const user = userEvent.setup();
    renderSection(null);

    await user.click(screen.getByText('Automatic (workspace domain)'));

    expect(screen.getByText('me@example.com')).toBeVisible();
    expect(screen.getByText('alias@example.com')).toBeVisible();
    expect(screen.queryByText('old@example.com')).toBeNull();
  });

  it('saves the chosen handle', async () => {
    const user = userEvent.setup();
    const store = renderSection(null);

    await user.click(screen.getByText('Automatic (workspace domain)'));
    await user.click(screen.getByText('alias@example.com'));

    expect(mockUpdateMyDefaultFromHandle).toHaveBeenCalledWith({
      variables: { input: { defaultFromHandle: 'alias@example.com' } },
    });
    expect(store.get(currentUserWorkspaceState.atom)?.defaultFromHandle).toBe(
      'alias@example.com',
    );
  });

  it('keeps fields changed on the atom while the save is pending', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    mockUpdateMyDefaultFromHandle.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = userEvent.setup();
    const store = renderSection(null);

    await user.click(screen.getByText('Automatic (workspace domain)'));
    await user.click(screen.getByText('alias@example.com'));

    store.set(currentUserWorkspaceState.atom, {
      ...store.get(currentUserWorkspaceState.atom),
      locale: 'fr-FR',
    } as never);

    resolveSave({ data: { updateMyDefaultFromHandle: true } });

    await waitFor(() =>
      expect(store.get(currentUserWorkspaceState.atom)?.defaultFromHandle).toBe(
        'alias@example.com',
      ),
    );
    expect(store.get(currentUserWorkspaceState.atom)).toMatchObject({
      locale: 'fr-FR',
      defaultFromHandle: 'alias@example.com',
    });
  });

  it('shows automatic when the stored handle no longer exists', () => {
    renderSection('removed@example.com');

    expect(screen.getByText('Automatic (workspace domain)')).toBeVisible();
    expect(screen.queryByText('removed@example.com')).toBeNull();
  });

  it('saves null when choosing automatic', async () => {
    const user = userEvent.setup();
    renderSection('me@example.com');

    await user.click(screen.getByText('me@example.com'));
    await user.click(screen.getByText('Automatic (workspace domain)'));

    expect(mockUpdateMyDefaultFromHandle).toHaveBeenCalledWith({
      variables: { input: { defaultFromHandle: null } },
    });
  });
});
