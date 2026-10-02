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

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

const ROLE_ID = 'role-id';

const PERSISTED_ROLE: RoleWithPartialMembers = {
  __typename: 'Role',
  id: ROLE_ID,
  label: 'Sales',
  description: '',
  icon: 'IconUser',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
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

  return renderHook(
    () => useSaveDraftRoleToDB({ roleId: ROLE_ID, isCreateMode, onSuccess }),
    { wrapper: Wrapper },
  );
};

describe('useSaveDraftRoleToDB', () => {
  beforeEach(() => {
    mockCreateRole.mockResolvedValue({
      data: { createOneRole: { id: ROLE_ID } },
    });
    mockOtherMutation.mockResolvedValue({ data: {} });
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
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(ROLE_ID);
  });
});
