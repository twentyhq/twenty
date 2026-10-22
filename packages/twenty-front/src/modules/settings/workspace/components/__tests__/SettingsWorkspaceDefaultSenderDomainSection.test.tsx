import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsWorkspaceDefaultSenderDomainSection } from '@/settings/workspace/components/SettingsWorkspaceDefaultSenderDomainSection';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const mockUpdateWorkspace = jest.fn();

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockUpdateWorkspace, { loading: false }],
}));

const buildAccount = (overrides: Record<string, unknown>) => ({
  id: 'account-id',
  handle: 'me@example.com',
  handleAliases: ['me@initech.com'],
  provider: ConnectedAccountProvider.GOOGLE,
  connectionParameters: null,
  archivedAt: null,
  ...overrides,
});

const renderSection = ({
  permissionFlags = [PermissionFlagType.WORKSPACE],
  defaultSenderDomain = null,
}: {
  permissionFlags?: PermissionFlagType[];
  defaultSenderDomain?: string | null;
} = {}) => {
  const store = createStore();
  store.set(currentWorkspaceState.atom, {
    id: 'workspace-id',
    defaultSenderDomain,
  } as never);
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags,
    objectsPermissions: [],
  } as never);
  store.set(myConnectedAccountsState.atom, [
    buildAccount({}),
    buildAccount({
      id: 'archived',
      handle: 'me@archived.com',
      handleAliases: null,
      archivedAt: '2026-01-01',
    }),
  ] as never);

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <SettingsWorkspaceDefaultSenderDomainSection />
      </I18nProvider>
    </Provider>,
  );

  return store;
};

describe('SettingsWorkspaceDefaultSenderDomainSection', () => {
  beforeEach(() => {
    mockUpdateWorkspace.mockReset();
    mockEnqueueToast.mockReset();
    mockUpdateWorkspace.mockResolvedValue({
      data: { updateWorkspace: { defaultSenderDomain: 'example.com' } },
    });
  });

  it('lists the domains of sendable addresses between None and Other', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByText('None'));

    const optionLabels = (await screen.findAllByRole('option')).map(
      (option) => option.textContent,
    );
    expect(optionLabels).toEqual([
      'None',
      'example.com',
      'initech.com',
      'Other domain…',
    ]);
  });

  it('saves a listed domain as soon as it is selected', async () => {
    const user = userEvent.setup();
    const store = renderSection();

    await user.click(screen.getByText('None'));
    await user.click(await screen.findByText('example.com'));

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({
      variables: { input: { defaultSenderDomain: 'example.com' } },
    });
    await waitFor(() =>
      expect(store.get(currentWorkspaceState.atom)?.defaultSenderDomain).toBe(
        'example.com',
      ),
    );
  });

  it('clears the domain when None is selected', async () => {
    const user = userEvent.setup();
    mockUpdateWorkspace.mockResolvedValue({
      data: { updateWorkspace: { defaultSenderDomain: null } },
    });
    const store = renderSection({ defaultSenderDomain: 'example.com' });

    await user.click(screen.getByText('example.com'));
    await user.click(await screen.findByRole('option', { name: 'None' }));

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({
      variables: { input: { defaultSenderDomain: null } },
    });
    await waitFor(() =>
      expect(
        store.get(currentWorkspaceState.atom)?.defaultSenderDomain,
      ).toBeNull(),
    );
  });

  it('reveals a text input for another domain and saves it on blur', async () => {
    const user = userEvent.setup();
    mockUpdateWorkspace.mockResolvedValue({
      data: { updateWorkspace: { defaultSenderDomain: 'teammates.io' } },
    });
    const store = renderSection();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByText('None'));
    await user.click(await screen.findByText('Other domain…'));

    expect(mockUpdateWorkspace).not.toHaveBeenCalled();

    await user.type(
      await screen.findByRole('textbox', { name: 'Default sending domain' }),
      'teammates.io',
    );
    await user.tab();

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({
      variables: { input: { defaultSenderDomain: 'teammates.io' } },
    });
    await waitFor(() =>
      expect(store.get(currentWorkspaceState.atom)?.defaultSenderDomain).toBe(
        'teammates.io',
      ),
    );
  });

  it('lists a saved custom domain as an option', async () => {
    const user = userEvent.setup();
    renderSection({ defaultSenderDomain: 'teammates.io' });

    await user.click(screen.getByText('teammates.io'));

    expect(
      (await screen.findAllByRole('option')).map(
        (option) => option.textContent,
      ),
    ).toEqual([
      'None',
      'example.com',
      'initech.com',
      'teammates.io',
      'Other domain…',
    ]);
  });

  it('keeps the saved domain selected and shows an error when saving fails', async () => {
    mockUpdateWorkspace.mockRejectedValue(new Error('Invalid domain'));
    const user = userEvent.setup();
    const store = renderSection({ defaultSenderDomain: 'example.com' });

    await user.click(screen.getByText('example.com'));
    await user.click(await screen.findByText('initech.com'));

    await waitFor(() => expect(mockEnqueueToast).toHaveBeenCalled());
    expect(store.get(currentWorkspaceState.atom)?.defaultSenderDomain).toBe(
      'example.com',
    );
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.queryByText('initech.com')).not.toBeInTheDocument();
  });

  it('reverts the text input and shows an error when the server rejects the domain', async () => {
    mockUpdateWorkspace.mockRejectedValue(new Error('Invalid domain'));
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByText('None'));
    await user.click(await screen.findByText('Other domain…'));

    const input = await screen.findByRole('textbox', {
      name: 'Default sending domain',
    });
    await user.type(input, 'not a domain');
    await user.tab();

    expect(mockEnqueueToast).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('does not save when the selected domain is already saved', async () => {
    const user = userEvent.setup();
    renderSection({ defaultSenderDomain: 'example.com' });

    await user.click(screen.getByText('example.com'));
    await user.click(
      await screen.findByRole('option', { name: 'example.com' }),
    );

    expect(mockUpdateWorkspace).not.toHaveBeenCalled();
  });

  it('is disabled without the workspace permission', () => {
    renderSection({ permissionFlags: [] });

    expect(screen.getByText('None').closest('[disabled]')).not.toBeNull();
  });

  it('blocks further changes while a save is pending', async () => {
    let resolveSave: (response: unknown) => void = () => {};
    mockUpdateWorkspace.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = userEvent.setup();
    renderSection();

    expect(screen.getByText('None').closest('[disabled]')).toBeNull();

    await user.click(screen.getByText('None'));
    await user.click(await screen.findByText('example.com'));

    await waitFor(() =>
      expect(screen.getByText('None').closest('[disabled]')).not.toBeNull(),
    );

    await user.click(screen.getByText('None'));
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(mockUpdateWorkspace).toHaveBeenCalledTimes(1);

    resolveSave({
      data: { updateWorkspace: { defaultSenderDomain: 'example.com' } },
    });

    await waitFor(() =>
      expect(screen.getByText('example.com').closest('[disabled]')).toBeNull(),
    );
  });

  it('disables the other-domain input while its save is pending', async () => {
    let resolveSave: (response: unknown) => void = () => {};
    mockUpdateWorkspace.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByText('None'));
    await user.click(await screen.findByText('Other domain…'));
    const input = await screen.findByRole('textbox', {
      name: 'Default sending domain',
    });
    await user.type(input, 'teammates.io');
    await user.tab();

    await waitFor(() => expect(input).toBeDisabled());

    resolveSave({
      data: { updateWorkspace: { defaultSenderDomain: 'teammates.io' } },
    });
    await waitFor(() =>
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument(),
    );
  });
});
