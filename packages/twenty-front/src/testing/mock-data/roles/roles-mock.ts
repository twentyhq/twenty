import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { FieldPermission, ObjectPermission, Role } from '~/generated/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

export const MOCK_ROLE_ID_GRANTS_ALL = 'role-id-1';
export const MOCK_ROLE_ID_REVOKES_ALL = 'role-id-2';

export const MOCK_OBJECT_PERMISSION_1_REVOKES_ALL: ObjectPermission = {
  objectMetadataId: 'object-metadata-1',
  canReadObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

export const MOCK_OBJECT_PERMISSION_2_GRANTS_ALL: ObjectPermission = {
  objectMetadataId: 'object-metadata-2',
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
};

export const MOCK_OBJECT_PERMISSION_3_NULL_ALL: ObjectPermission = {
  objectMetadataId: 'object-metadata-3',
  canReadObjectRecords: null,
  canUpdateObjectRecords: null,
  canSoftDeleteObjectRecords: null,
  canDestroyObjectRecords: null,
};

export const BASE_FIELD_PERMISSION: Omit<FieldPermission, 'roleId'> = {
  id: 'field-permission-1',
  fieldMetadataId: 'field-metadata-id-1',
  objectMetadataId: MOCK_OBJECT_PERMISSION_1_REVOKES_ALL.objectMetadataId,
  canReadFieldValue: false,
  canUpdateFieldValue: false,
};

export const BASE_FIELD_PERMISSION_OBJECT_METADATA_3: Omit<
  FieldPermission,
  'roleId'
> = {
  id: 'field-permission-1',
  fieldMetadataId: 'field-metadata-id-1',
  objectMetadataId: 'object-metadata-3',
  canReadFieldValue: false,
  canUpdateFieldValue: false,
};

export const BASE_ROLE_MOCK_GRANTS_ALL: Role = {
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: true,
  canUpdateAllSettings: true,
  id: MOCK_ROLE_ID_GRANTS_ALL,
  isEditable: true,
  label: 'Role grants all',
  workspaceMembers: [],
  fieldPermissions: [
    { ...BASE_FIELD_PERMISSION, roleId: MOCK_ROLE_ID_GRANTS_ALL },
    {
      ...BASE_FIELD_PERMISSION_OBJECT_METADATA_3,
      roleId: MOCK_ROLE_ID_GRANTS_ALL,
    },
  ],
  objectPermissions: [
    MOCK_OBJECT_PERMISSION_1_REVOKES_ALL,
    MOCK_OBJECT_PERMISSION_2_GRANTS_ALL,
    MOCK_OBJECT_PERMISSION_3_NULL_ALL,
  ],
};

export const BASE_ROLE_MOCK_REVOKES_ALL: Role = {
  canAccessAllTools: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: true,
  id: MOCK_ROLE_ID_REVOKES_ALL,
  isEditable: true,
  label: 'Role revokes all',
  workspaceMembers: [],
  fieldPermissions: [
    { ...BASE_FIELD_PERMISSION, roleId: MOCK_ROLE_ID_REVOKES_ALL },
    {
      ...BASE_FIELD_PERMISSION_OBJECT_METADATA_3,
      roleId: MOCK_ROLE_ID_REVOKES_ALL,
    },
  ],
  objectPermissions: [
    MOCK_OBJECT_PERMISSION_1_REVOKES_ALL,
    MOCK_OBJECT_PERMISSION_2_GRANTS_ALL,
    MOCK_OBJECT_PERMISSION_3_NULL_ALL,
  ],
};

export const rolesMockHookWrapper = getJestMetadataAndApolloMocksWrapper({
  onInitializeRecoilSnapshot: (snapshot) => {
    snapshot.set(
      settingsDraftRoleFamilyState(MOCK_ROLE_ID_GRANTS_ALL),
      BASE_ROLE_MOCK_GRANTS_ALL,
    );
    snapshot.set(
      settingsDraftRoleFamilyState(MOCK_ROLE_ID_REVOKES_ALL),
      BASE_ROLE_MOCK_REVOKES_ALL,
    );
  },
});
