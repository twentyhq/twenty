import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStorePageCommandsComponentState } from '@/context-store/states/contextStorePageCommandsComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { SettingsRoleRouteGuard } from '@/settings/roles/components/SettingsRoleRouteGuard';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const mockSaveDraftRoleToDB = jest.fn();
const mockLoadCurrentUser = jest.fn();
const mockEnqueueToast = jest.fn();
const mockNavigateSettings = jest.fn();

jest.mock('@/settings/roles/components/SettingsRolesQueryEffect', () => ({
  SettingsRolesQueryEffect: () => null,
}));

jest.mock('@/ui/layout/page/components/WorkspaceRouteUnavailable', () => ({
  WorkspaceRouteUnavailable: () => <div>Role unavailable</div>,
}));

jest.mock('@/settings/roles/role/hooks/useSaveDraftRoleToDB', () => ({
  useSaveDraftRoleToDB: () => ({ saveDraftRoleToDB: mockSaveDraftRoleToDB }),
}));

jest.mock(
  '@/settings/roles/role-permissions/agent-chat-channels/hooks/useIsRoleAgentChatChannelAccessDirty',
  () => ({
    useIsRoleAgentChatChannelAccessDirty: () => false,
  }),
);

jest.mock(
  '@/settings/roles/role-permissions/agent-chat-channels/hooks/useSaveRoleAgentChatChannelAccess',
  () => ({
    useSaveRoleAgentChatChannelAccess: () => ({
      saveRoleAgentChatChannelAccess: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/settings/roles/role-permissions/agent-chat-channels/hooks/useResetRoleAgentChatChannelAccess',
  () => ({
    useResetRoleAgentChatChannelAccess: () => ({
      resetRoleAgentChatChannelAccess: jest.fn(),
    }),
  }),
);

jest.mock('@/ai/hooks/useRefreshAgentChatChannels', () => ({
  useRefreshAgentChatChannels: () => ({ refreshAgentChatChannels: jest.fn() }),
}));

jest.mock('@/users/hooks/useLoadCurrentUser', () => ({
  useLoadCurrentUser: () => ({ loadCurrentUser: mockLoadCurrentUser }),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigateSettings,
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/settings/components/layout/SettingsPageLayout', () => ({
  SettingsPageLayout: ({
    pageCommands,
    children,
  }: {
    pageCommands?: ReactNode;
    children: ReactNode;
  }) => (
    <>
      {pageCommands}
      {children}
    </>
  ),
}));

jest.mock('@/settings/components/layout/SettingsTabBar', () => ({
  SettingsTabBar: () => null,
}));

jest.mock(
  '@/settings/roles/role/components/SettingsRoleLabelContainer',
  () => ({
    SettingsRoleLabelContainer: () => null,
  }),
);

jest.mock(
  '@/settings/roles/role-assignment/components/SettingsRoleAssignment',
  () => ({ SettingsRoleAssignment: () => null }),
);

jest.mock(
  '@/settings/roles/role-permissions/components/SettingsRolePermissions',
  () => ({ SettingsRolePermissions: () => null }),
);

jest.mock(
  '@/settings/roles/role-settings/components/SettingsRoleSettings',
  () => ({ SettingsRoleSettings: () => null }),
);

const ROLE_ID = 'role-id';

const PERSISTED_ROLE: RoleWithPartialMembers = {
  __typename: 'Role',
  id: ROLE_ID,
  label: 'Sales',
  description: '',
  icon: 'IconUser',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canAccessAllAgentChatChannels: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
  applicationId: 'application-id',
  isEditable: true,
  workspaceMembers: [],
  agents: [],
  apiKeys: [],
  permissionFlags: [],
  objectPermissions: [],
  fieldPermissions: [],
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const renderSettingsRole = ({
  draftLabel,
  isCreateMode = false,
  scopeId = null,
}: {
  draftLabel: string;
  isCreateMode?: boolean;
  scopeId?: string | null;
}) => {
  const store = createStore();

  store.set(
    settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
    isCreateMode ? undefined : PERSISTED_ROLE,
  );
  store.set(settingsDraftRoleFamilyState.getAtom(ROLE_ID, scopeId), {
    ...PERSISTED_ROLE,
    label: draftLabel,
  });

  const rendered = render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <JotaiProvider store={store}>
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
          >
            <RoutedFlowStateScopeContext.Provider value={scopeId}>
              <SettingsRole roleId={ROLE_ID} isCreateMode={isCreateMode} />
            </RoutedFlowStateScopeContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </JotaiProvider>
      </MemoryRouter>
    </I18nProvider>,
  );

  const getPageCommand = (engineComponentKey: EngineComponentKey) =>
    store.get(
      contextStorePageCommandsComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
    )[engineComponentKey];

  const runPageCommand = async (engineComponentKey: EngineComponentKey) => {
    await act(async () => {
      await getPageCommand(engineComponentKey)?.run();
    });
  };

  return { ...rendered, store, getPageCommand, runPageCommand };
};

describe('SettingsRole', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each([null, 'role-creation-flow'])(
    'should prevent a canceled draft from reopening in scope %s',
    async (scopeId) => {
      const { store, unmount, runPageCommand } = renderSettingsRole({
        draftLabel: 'Canceled role',
        isCreateMode: true,
        scopeId,
      });

      await runPageCommand(EngineComponentKey.CANCEL_PAGE);

      expect(mockNavigateSettings).toHaveBeenCalledTimes(1);
      expect(mockNavigateSettings).toHaveBeenCalledWith(SettingsPath.Roles);
      expect(mockSaveDraftRoleToDB).not.toHaveBeenCalled();

      unmount();
      store.set(settingsRolesIsLoadingState.atom, false);

      render(
        <JotaiProvider store={store}>
          <RoutedFlowStateScopeContext.Provider value={scopeId}>
            <SettingsRoleRouteGuard roleId={ROLE_ID}>
              <div>Role editor</div>
            </SettingsRoleRouteGuard>
          </RoutedFlowStateScopeContext.Provider>
        </JotaiProvider>,
      );

      expect(screen.getByText('Role unavailable')).toBeInTheDocument();
      expect(screen.queryByText('Role editor')).not.toBeInTheDocument();
    },
  );

  it('should restore the persisted role when canceling edits', async () => {
    const { store, runPageCommand } = renderSettingsRole({
      draftLabel: 'Changed role',
    });

    await runPageCommand(EngineComponentKey.CANCEL_PAGE);

    expect(store.get(settingsDraftRoleFamilyState.atomFamily(ROLE_ID))).toEqual(
      PERSISTED_ROLE,
    );
    expect(mockNavigateSettings).not.toHaveBeenCalled();
    expect(mockSaveDraftRoleToDB).not.toHaveBeenCalled();
  });

  it('should leave the save command usable when saving is rejected because the role name is empty', async () => {
    const { getPageCommand, runPageCommand } = renderSettingsRole({
      draftLabel: '',
    });

    await runPageCommand(EngineComponentKey.SAVE_PAGE);

    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        children: 'Role name cannot be empty',
      }),
    );
    expect(mockSaveDraftRoleToDB).not.toHaveBeenCalled();
    expect(getPageCommand(EngineComponentKey.SAVE_PAGE)).toMatchObject({
      isDisabled: false,
      isLoading: false,
    });
  });

  it('should show the save command as loading until the role is saved', async () => {
    let resolveSave: () => void = () => {};

    mockSaveDraftRoleToDB.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );

    const { getPageCommand } = renderSettingsRole({
      draftLabel: 'Sales team',
    });

    let savePromise: Promise<unknown> | void = undefined;

    act(() => {
      savePromise = getPageCommand(EngineComponentKey.SAVE_PAGE)?.run();
    });

    expect(getPageCommand(EngineComponentKey.SAVE_PAGE)).toMatchObject({
      isLoading: true,
    });

    await act(async () => {
      resolveSave();
      await savePromise;
    });

    expect(getPageCommand(EngineComponentKey.SAVE_PAGE)).toMatchObject({
      isLoading: false,
    });
    expect(mockSaveDraftRoleToDB).toHaveBeenCalledTimes(1);
    expect(mockLoadCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast and leave the save command usable when the save fails', async () => {
    mockSaveDraftRoleToDB.mockRejectedValue(new Error('Save failed'));

    const { getPageCommand, runPageCommand } = renderSettingsRole({
      draftLabel: 'Sales team',
    });

    await runPageCommand(EngineComponentKey.SAVE_PAGE);

    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    );
    expect(mockLoadCurrentUser).not.toHaveBeenCalled();
    expect(getPageCommand(EngineComponentKey.SAVE_PAGE)).toMatchObject({
      isLoading: false,
    });
  });
});
