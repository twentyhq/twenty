import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { UPSERT_ROW_LEVEL_PERMISSION_PREDICATES } from '@/settings/roles/graphql/mutations/upsertRowLevelPermissionPredicatesMutation';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  CreateOneRoleDocument,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const mockUseMutation = jest.fn();
const mockCreateRole = jest.fn();
const mockUpsertRowLevelPermissionPredicates = jest.fn();
const mockOtherMutation = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
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

const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';
const PERSON_OBJECT_METADATA_ID = 'person-object-metadata-id';

const buildPredicateGroup = (
  objectMetadataId: string,
): RowLevelPermissionPredicateGroup => ({
  __typename: 'RowLevelPermissionPredicateGroup',
  id: `${objectMetadataId}-group`,
  objectMetadataId,
  roleId: ROLE_ID,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  parentRowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: 0,
});

const buildPredicate = ({
  objectMetadataId,
  value,
}: {
  objectMetadataId: string;
  value: string;
}): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id: `${objectMetadataId}-predicate`,
  objectMetadataId,
  roleId: ROLE_ID,
  fieldMetadataId: `${objectMetadataId}-name-field`,
  operand: RowLevelPermissionPredicateOperand.IS,
  value,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: `${objectMetadataId}-group`,
  positionInRowLevelPermissionPredicateGroup: 0,
});

const PERSISTED_ROLE_WITH_RULES: RoleWithPartialMembers = {
  ...PERSISTED_ROLE,
  rowLevelPermissionPredicates: [
    buildPredicate({
      objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      value: 'Acme',
    }),
    buildPredicate({
      objectMetadataId: PERSON_OBJECT_METADATA_ID,
      value: 'Jane',
    }),
  ],
  rowLevelPermissionPredicateGroups: [
    buildPredicateGroup(COMPANY_OBJECT_METADATA_ID),
    buildPredicateGroup(PERSON_OBJECT_METADATA_ID),
  ],
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
    mockUpsertRowLevelPermissionPredicates.mockResolvedValue({ data: {} });
    mockOtherMutation.mockResolvedValue({ data: {} });
    mockUseMutation.mockImplementation((document: unknown) => {
      if (document === CreateOneRoleDocument) {
        return [mockCreateRole];
      }

      if (document === UPSERT_ROW_LEVEL_PERMISSION_PREDICATES) {
        return [mockUpsertRowLevelPermissionPredicates];
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

  it('should only upsert the row level permission rules of the changed object', async () => {
    const { result } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      draftRole: {
        ...PERSISTED_ROLE_WITH_RULES,
        rowLevelPermissionPredicates: [
          buildPredicate({
            objectMetadataId: COMPANY_OBJECT_METADATA_ID,
            value: 'Globex',
          }),
          buildPredicate({
            objectMetadataId: PERSON_OBJECT_METADATA_ID,
            value: 'Jane',
          }),
        ],
      },
      persistedRole: PERSISTED_ROLE_WITH_RULES,
      onSuccess: jest.fn(),
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(mockUpsertRowLevelPermissionPredicates).toHaveBeenCalledTimes(1);
    expect(mockUpsertRowLevelPermissionPredicates).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: expect.objectContaining({
            roleId: ROLE_ID,
            objectMetadataId: COMPANY_OBJECT_METADATA_ID,
            predicates: [expect.objectContaining({ value: 'Globex' })],
          }),
        },
      }),
    );
  });

  it('should upsert empty row level permission rules for a cleared object', async () => {
    const { result } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      draftRole: {
        ...PERSISTED_ROLE_WITH_RULES,
        rowLevelPermissionPredicates: [
          buildPredicate({
            objectMetadataId: PERSON_OBJECT_METADATA_ID,
            value: 'Jane',
          }),
        ],
        rowLevelPermissionPredicateGroups: [
          buildPredicateGroup(PERSON_OBJECT_METADATA_ID),
        ],
      },
      persistedRole: PERSISTED_ROLE_WITH_RULES,
      onSuccess: jest.fn(),
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(mockUpsertRowLevelPermissionPredicates).toHaveBeenCalledTimes(1);
    expect(mockUpsertRowLevelPermissionPredicates).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            roleId: ROLE_ID,
            objectMetadataId: COMPANY_OBJECT_METADATA_ID,
            predicates: [],
            predicateGroups: [],
          },
        },
      }),
    );
  });

  it('should not upsert row level permission rules when no object rules changed', async () => {
    const onSuccess = jest.fn();

    const { result } = renderUseSaveDraftRoleToDB({
      isCreateMode: false,
      draftRole: {
        ...PERSISTED_ROLE_WITH_RULES,
        rowLevelPermissionPredicates: [
          buildPredicate({
            objectMetadataId: PERSON_OBJECT_METADATA_ID,
            value: 'Jane',
          }),
          buildPredicate({
            objectMetadataId: COMPANY_OBJECT_METADATA_ID,
            value: 'Acme',
          }),
        ],
        rowLevelPermissionPredicateGroups: [
          buildPredicateGroup(PERSON_OBJECT_METADATA_ID),
          buildPredicateGroup(COMPANY_OBJECT_METADATA_ID),
        ],
      },
      persistedRole: PERSISTED_ROLE_WITH_RULES,
      onSuccess,
    });

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(mockUpsertRowLevelPermissionPredicates).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(ROLE_ID);
  });
});
