import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { SettingsWorkspaceDefaultSenderDomainSection } from '@/settings/workspace/components/SettingsWorkspaceDefaultSenderDomainSection';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
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

const renderSection = (permissionFlags: PermissionFlagType[]) => {
  const store = createStore();
  store.set(currentWorkspaceState.atom, {
    id: 'workspace-id',
    defaultSenderDomain: null,
  } as never);
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags,
    objectsPermissions: [],
  } as never);

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
    mockUpdateWorkspace.mockResolvedValue({
      data: { updateWorkspace: { defaultSenderDomain: 'getindexed.ai' } },
    });
  });

  it('saves the typed domain on blur', async () => {
    const user = userEvent.setup();
    const store = renderSection([PermissionFlagType.WORKSPACE]);

    await user.type(
      screen.getByRole('textbox', { name: 'Default sending domain' }),
      'getindexed.ai',
    );
    await user.tab();

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({
      variables: { input: { defaultSenderDomain: 'getindexed.ai' } },
    });
    expect(store.get(currentWorkspaceState.atom)?.defaultSenderDomain).toBe(
      'getindexed.ai',
    );
  });

  it('reverts the input and shows an error when the server rejects the domain', async () => {
    mockUpdateWorkspace.mockRejectedValue(new Error('Invalid domain'));
    const user = userEvent.setup();
    renderSection([PermissionFlagType.WORKSPACE]);

    const input = screen.getByRole('textbox', {
      name: 'Default sending domain',
    });
    await user.type(input, 'not a domain');
    await user.tab();

    expect(mockEnqueueToast).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('does not save when the value is unchanged', async () => {
    const user = userEvent.setup();
    renderSection([PermissionFlagType.WORKSPACE]);

    await user.click(
      screen.getByRole('textbox', { name: 'Default sending domain' }),
    );
    await user.tab();

    expect(mockUpdateWorkspace).not.toHaveBeenCalled();
  });

  it('is disabled without the workspace permission', () => {
    renderSection([]);

    expect(
      screen.getByRole('textbox', { name: 'Default sending domain' }),
    ).toBeDisabled();
  });
});
