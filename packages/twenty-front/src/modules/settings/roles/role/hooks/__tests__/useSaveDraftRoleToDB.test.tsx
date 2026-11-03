import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  AssignRoleToApiKeyDocument,
  CreateOneRoleDocument,
} from '~/generated-metadata/graphql';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';

const mockUseMutation = jest.fn();
const mockCreateRole = jest.fn();
const mockOtherMutation = jest.fn();
const mockAssignApiKey = jest.fn();
const mockRolesQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useApolloClient: () => ({ query: mockRolesQuery }),
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
    mockAssignApiKey.mockResolvedValue({ data: {} });
    mockRolesQuery.mockResolvedValue({ data: {} });
    mockUseMutation.mockImplementation((document: unknown) => {
      if (document === CreateOneRoleDocument) {
        return [mockCreateRole];
      }
      if (document === AssignRoleToApiKeyDocument) {
        return [mockAssignApiKey];
      }
      return [mockOtherMutation];
    });
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

  it('assigns only added targets and waits for the final role refresh before acknowledging Save', async () => {
    const retainedKey = {
      id: 'retained-key',
      name: 'Retained',
      expiresAt: '2027-01-01T00:00:00Z',
    };
    const addedKey = {
      id: 'added-key',
      name: 'Added',
      expiresAt: '2027-01-01T00:00:00Z',
    };
    const persistedRole = { ...PERSISTED_ROLE, apiKeys: [retainedKey] };
    const onSuccess = jest.fn();
    let finishRefresh: () => void = () => undefined;
    mockRolesQuery.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRefresh = () => resolve({ data: {} });
        }),
    );
    const { result } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      persistedRole,
      draftRole: { ...persistedRole, apiKeys: [retainedKey, addedKey] },
      onSuccess,
    });
    const save = result.current.saveDraftRoleToDB();

    await waitFor(() => expect(mockRolesQuery).toHaveBeenCalled());
    expect(mockAssignApiKey).toHaveBeenCalledTimes(1);
    expect(mockAssignApiKey).toHaveBeenCalledWith({
      variables: { roleId: ROLE_ID, apiKeyId: addedKey.id },
    });
    expect(mockRolesQuery).toHaveBeenCalledWith({
      query: GET_ROLES,
      fetchPolicy: 'network-only',
    });
    expect(onSuccess).not.toHaveBeenCalled();

    await act(async () => {
      finishRefresh();
      await save;
    });

    expect(onSuccess).toHaveBeenCalledWith(ROLE_ID);
  });
});
