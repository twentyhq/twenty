import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { CreateOneRoleDocument } from '~/generated-metadata/graphql';

const mockUseMutation = jest.fn();
const mockCreateRole = jest.fn();
const mockOtherMutation = jest.fn();
const mockQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useApolloClient: () => ({ query: mockQuery }),
}));

const ROLE_ID = 'role-id';

const ROLE_BASIC_FIELDS_INPUT = {
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
};

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

const renderUseSaveDraftRoleToDB = ({
  isCreateMode,
  draftRole,
  persistedRole,
  onSuccess,
}: {
  isCreateMode: boolean;
  draftRole: RoleWithPartialMembers;
  persistedRole: RoleWithPartialMembers | undefined;
  onSuccess: (savedRoleId: string) => void;
}) => {
  const store = createStore();

  store.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), draftRole);
  store.set(
    settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
    persistedRole,
  );

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

  return {
    store,
    ...renderHook(
      () => useSaveDraftRoleToDB({ roleId: ROLE_ID, isCreateMode, onSuccess }),
      { wrapper: Wrapper },
    ),
  };
};

describe('useSaveDraftRoleToDB', () => {
  beforeEach(() => {
    mockCreateRole.mockResolvedValue({
      data: { createOneRole: { id: ROLE_ID } },
    });
    mockOtherMutation.mockResolvedValue({ data: {} });
    mockQuery.mockResolvedValue({ data: { getRoles: [] } });
    mockUseMutation.mockImplementation((document: unknown) => [
      document === CreateOneRoleDocument ? mockCreateRole : mockOtherMutation,
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call onSuccess once with the created role id when creating a role', async () => {
    const onSuccess = jest.fn();

    const { result } = renderUseSaveDraftRoleToDB({
      isCreateMode: true,
      draftRole: { ...PERSISTED_ROLE, label: 'New role' },
      persistedRole: undefined,
      onSuccess,
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(mockCreateRole).toHaveBeenCalledTimes(1);
    expect(mockCreateRole).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          createRoleInput: {
            id: ROLE_ID,
            label: 'New role',
            ...ROLE_BASIC_FIELDS_INPUT,
          },
        },
      }),
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(ROLE_ID);
  });

  it('should not call onSuccess when the role creation returns no data', async () => {
    const onSuccess = jest.fn();

    mockCreateRole.mockResolvedValue({ data: undefined });

    const { result } = renderUseSaveDraftRoleToDB({
      isCreateMode: true,
      draftRole: { ...PERSISTED_ROLE, label: 'New role' },
      persistedRole: undefined,
      onSuccess,
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should call onSuccess once with the role id when updating a role', async () => {
    const onSuccess = jest.fn();

    const { result } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      draftRole: { ...PERSISTED_ROLE, label: 'Sales team' },
      persistedRole: PERSISTED_ROLE,
      onSuccess,
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(mockCreateRole).not.toHaveBeenCalled();
    expect(mockOtherMutation).toHaveBeenCalledTimes(1);
    expect(mockOtherMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          updateRoleInput: {
            id: ROLE_ID,
            update: { label: 'Sales team', ...ROLE_BASIC_FIELDS_INPUT },
          },
        },
      }),
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(ROLE_ID);
  });

  it('should replace the draft with the saved role after a save', async () => {
    const savedRole = {
      ...PERSISTED_ROLE,
      label: 'Sales team',
      rowLevelPermissionRules: [],
    };

    mockQuery.mockResolvedValue({ data: { getRoles: [savedRole] } });

    const { result, store } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      draftRole: { ...PERSISTED_ROLE, label: 'Sales team' },
      persistedRole: PERSISTED_ROLE,
      onSuccess: jest.fn(),
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(store.get(settingsDraftRoleFamilyState.atomFamily(ROLE_ID))).toEqual(
      savedRole,
    );
    expect(
      store.get(settingsPersistedRoleFamilyState.atomFamily(ROLE_ID)),
    ).toEqual(savedRole);
  });

  it('should keep a draft edited during the save', async () => {
    const editedDraftRole = { ...PERSISTED_ROLE, label: 'Edited during save' };

    mockQuery.mockResolvedValue({
      data: { getRoles: [{ ...PERSISTED_ROLE, label: 'Sales team' }] },
    });

    const { result, store } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      draftRole: { ...PERSISTED_ROLE, label: 'Sales team' },
      persistedRole: PERSISTED_ROLE,
      onSuccess: jest.fn(),
    });

    mockOtherMutation.mockImplementation(async () => {
      store.set(
        settingsDraftRoleFamilyState.atomFamily(ROLE_ID),
        editedDraftRole,
      );

      return { data: {} };
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(store.get(settingsDraftRoleFamilyState.atomFamily(ROLE_ID))).toEqual(
      editedDraftRole,
    );
  });

  it('should leave the draft untouched when the save fails', async () => {
    const draftRole = { ...PERSISTED_ROLE, label: 'Sales team' };

    mockOtherMutation.mockRejectedValue(new Error('Save failed'));

    const { result, store } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      draftRole,
      persistedRole: PERSISTED_ROLE,
      onSuccess: jest.fn(),
    });

    await act(async () => {
      await expect(result.current.saveDraftRoleToDB()).rejects.toThrow(
        'Save failed',
      );
    });

    expect(mockQuery).not.toHaveBeenCalled();
    expect(store.get(settingsDraftRoleFamilyState.atomFamily(ROLE_ID))).toEqual(
      draftRole,
    );
  });
});
