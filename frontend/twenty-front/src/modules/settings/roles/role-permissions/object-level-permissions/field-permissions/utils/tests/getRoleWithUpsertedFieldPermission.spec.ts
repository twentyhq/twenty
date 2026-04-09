import { type FieldPermission, type Role } from '~/generated-metadata/graphql';
import { getRoleWithUpsertedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithUpsertedFieldPermission';

const BASE_ROLE_MOCK: Role = {
  canAccessAllTools: false,
  canDestroyAllObjectRecords: true,
  canReadAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canUpdateAllSettings: true,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
  id: '1',
  isEditable: true,
  label: 'Role base',
  agents: [],
  apiKeys: [],
  workspaceMembers: [],
};

const BASE_FIELD_PERMISSION_TO_UPSERT: FieldPermission = {
  id: 'field-permission-1',
  fieldMetadataId: 'field-metadata-id-1',
  objectMetadataId: 'object-metadata-id-1',
  roleId: '1',
  canReadFieldValue: false,
  canUpdateFieldValue: false,
};

describe('getRoleWithUpsertedFieldPermission', () => {
  it('should work with undefined fieldPermission property on role', () => {
    const role: Role = {
      ...BASE_ROLE_MOCK,
    };

    const fieldPermissionToUpsert: FieldPermission = {
      ...BASE_FIELD_PERMISSION_TO_UPSERT,
    };

    expect(role.fieldPermissions).toBeUndefined();

    const updatedRole = getRoleWithUpsertedFieldPermission(
      role,
      fieldPermissionToUpsert,
    );

    expect(updatedRole.fieldPermissions).toBeDefined();
    expect(updatedRole.fieldPermissions).toContain(fieldPermissionToUpsert);
  });

  it('should work with existing fieldPermission', () => {
    const baseFieldPermission: FieldPermission = {
      ...BASE_FIELD_PERMISSION_TO_UPSERT,
    };

    const role: Role = {
      ...BASE_ROLE_MOCK,
      fieldPermissions: [baseFieldPermission],
    };

    expect(role.fieldPermissions).toBeDefined();
    expect(role.fieldPermissions).toContain(baseFieldPermission);

    const fieldPermissionToUpsert: FieldPermission = {
      ...BASE_FIELD_PERMISSION_TO_UPSERT,
      canReadFieldValue: undefined,
      canUpdateFieldValue: undefined,
    };

    const updatedRole = getRoleWithUpsertedFieldPermission(
      role,
      fieldPermissionToUpsert,
    );

    expect(updatedRole.fieldPermissions).toContain(fieldPermissionToUpsert);
    expect(updatedRole.fieldPermissions?.[0].canReadFieldValue).not.toEqual(
      role.fieldPermissions?.[0].canReadFieldValue,
    );
    expect(updatedRole.fieldPermissions?.[0].canUpdateFieldValue).not.toEqual(
      role.fieldPermissions?.[0].canUpdateFieldValue,
    );
  });

  it('should push fieldPermission in existing array', () => {
    const role: Role = {
      ...BASE_ROLE_MOCK,
      fieldPermissions: [BASE_FIELD_PERMISSION_TO_UPSERT],
    };

    expect(role.fieldPermissions).toBeDefined();
    expect(role.fieldPermissions?.length).toBe(1);

    const fieldPermissionToPush: FieldPermission = {
      ...BASE_FIELD_PERMISSION_TO_UPSERT,
      fieldMetadataId: 'field-metadata-id-2',
      id: '2',
    };

    const updatedRole = getRoleWithUpsertedFieldPermission(
      role,
      fieldPermissionToPush,
    );

    expect(updatedRole.fieldPermissions).toContain(fieldPermissionToPush);
    expect(updatedRole.fieldPermissions).toContain(
      BASE_FIELD_PERMISSION_TO_UPSERT,
    );
    expect(updatedRole.fieldPermissions?.length).toBe(2);
  });
});
