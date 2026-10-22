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
  handle: 'me@getindexed.ai',
  handleAliases: ['me@pageweaver.com'],
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

const openSelect = async (
  user: ReturnType<typeof userEvent.setup>,
  currentText: string,
) => {
  await user.click(screen.getByText(currentText));
};

describe('SettingsWorkspaceDefaultSenderDomainSection', () => {
  beforeEach(() => {
    mockUpdateWorkspace.mockReset();
    mockEnqueueToast.mockReset();
    mockUpdateWorkspace.mockResolvedValue({
      data: { updateWorkspace: { defaultSenderDomain: 'getindexed.ai' } },
    });
  });

  it('lists the domains of sendable addresses between None and Other', async () => {
    const user = userEvent.setup();
    renderSection();

    await openSelect(user, 'None');

    const optionLabels = (await screen.findAllByRole('option')).map(
      (option) => option.textContent,
    );
    expect(optionLabels).toEqual([
      'None',
      'getindexed.ai',
      'pageweaver.com',
      'Other domain…',
    ]);
  });

  it('saves a listed domain as soon as it is selected', async () => {
    const user = userEvent.setup();
    const store = renderSection();

    await openSelect(user, 'None');
    await user.click(await screen.findByText('getindexed.ai'));

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({
      variables: { input: { defaultSenderDomain: 'getindexed.ai' } },
    });
    await waitFor(() =>
      expect(store.get(currentWorkspaceState.atom)?.defaultSenderDomain).toBe(
        'getindexed.ai',
      ),
    );
  });

  it('clears the domain when None is selected', async () => {
    const user = userEvent.setup();
    mockUpdateWorkspace.mockResolvedValue({
      data: { updateWorkspace: { defaultSenderDomain: null } },
    });
    const store = renderSection({ defaultSenderDomain: 'getindexed.ai' });

    await openSelect(user, 'getindexed.ai');
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

    await openSelect(user, 'None');
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

    await openSelect(user, 'teammates.io');

    expect(
      (await screen.findAllByRole('option')).map((option) => option.textContent),
    ).toEqual([
      'None',
      'getindexed.ai',
      'pageweaver.com',
      'teammates.io',
      'Other domain…',
    ]);
  });

  it('keeps the saved domain selected and shows an error when saving fails', async () => {
    mockUpdateWorkspace.mockRejectedValue(new Error('Invalid domain'));
    const user = userEvent.setup();
    const store = renderSection({ defaultSenderDomain: 'getindexed.ai' });

    await openSelect(user, 'getindexed.ai');
    await user.click(await screen.findByText('pageweaver.com'));

    await waitFor(() => expect(mockEnqueueToast).toHaveBeenCalled());
    expect(store.get(currentWorkspaceState.atom)?.defaultSenderDomain).toBe(
      'getindexed.ai',
    );
    expect(screen.getByText('getindexed.ai')).toBeInTheDocument();
    expect(screen.queryByText('pageweaver.com')).not.toBeInTheDocument();
  });

  it('reverts the text input and shows an error when the server rejects the domain', async () => {
    mockUpdateWorkspace.mockRejectedValue(new Error('Invalid domain'));
    const user = userEvent.setup();
    renderSection();

    await openSelect(user, 'None');
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
    renderSection({ defaultSenderDomain: 'getindexed.ai' });

    await openSelect(user, 'getindexed.ai');
    await user.click(
      await screen.findByRole('option', { name: 'getindexed.ai' }),
    );

    expect(mockUpdateWorkspace).not.toHaveBeenCalled();
  });

  it('is disabled without the workspace permission', () => {
    renderSection({ permissionFlags: [] });

    expect(screen.getByText('None').closest('[disabled]')).not.toBeNull();
  });

  it('blocks further changes while a save is pending', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    mockUpdateWorkspace.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = userEvent.setup();
    renderSection();

    expect(screen.getByText('None').closest('[disabled]')).toBeNull();

    await openSelect(user, 'None');
    await user.click(await screen.findByText('getindexed.ai'));

    await waitFor(() =>
      expect(screen.getByText('None').closest('[disabled]')).not.toBeNull(),
    );

    await user.click(screen.getByText('None'));
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(mockUpdateWorkspace).toHaveBeenCalledTimes(1);

    resolveSave({
      data: { updateWorkspace: { defaultSenderDomain: 'getindexed.ai' } },
    });

    await waitFor(() =>
      expect(
        screen.getByText('getindexed.ai').closest('[disabled]'),
      ).toBeNull(),
    );
  });

  it('disables the other-domain input while its save is pending', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    mockUpdateWorkspace.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = userEvent.setup();
    renderSection();

    await openSelect(user, 'None');
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
