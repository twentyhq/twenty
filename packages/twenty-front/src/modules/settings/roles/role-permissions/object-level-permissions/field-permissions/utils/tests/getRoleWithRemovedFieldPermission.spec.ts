import { FieldPermission, Role } from '~/generated-metadata/graphql';
import { getRoleWithRemovedFieldPermission } from '../getRoleWithRemovedFieldPermission';

const BASE_FIELD_PERMISSION: FieldPermission = {
  id: 'field-permission-1',
  fieldMetadataId: 'field-metadata-id-1',
  objectMetadataId: 'object-metadata-id-1',
  roleId: '1',
  canReadFieldValue: false,
  canUpdateFieldValue: false,
};

const BASE_ROLE_MOCK: Role = {
  canAccessAllTools: false,
  canDestroyAllObjectRecords: true,
  canReadAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canUpdateAllSettings: true,
  id: '1',
  isEditable: true,
  label: 'Role base',
  workspaceMembers: [],
  fieldPermissions: [BASE_FIELD_PERMISSION],
};

describe('getRoleWithRemovedFieldPermission', () => {
  it('should remove field permission with given fieldMetadataId', () => {
    const role: Role = {
      ...BASE_ROLE_MOCK,
    };

    expect(role.fieldPermissions).toBeDefined();

    const updatedRole = getRoleWithRemovedFieldPermission(
      role,
      BASE_FIELD_PERMISSION.fieldMetadataId,
    );

    expect(updatedRole.fieldPermissions).toBeDefined();
    expect(updatedRole.fieldPermissions?.length).toBe(0);
  });

  it('should not remove not found fieldPermission', () => {
    const role: Role = {
      ...BASE_ROLE_MOCK,
    };

    expect(role.fieldPermissions?.length).toBe(1);

    const updatedRole = getRoleWithRemovedFieldPermission(role, 'unknown-id');

    expect(updatedRole.fieldPermissions?.length).toBe(1);
  });

  it('should not remove if no fieldPermission property', () => {
    const role: Role = {
      ...BASE_ROLE_MOCK,
      fieldPermissions: undefined,
    };

    expect(role.fieldPermissions).not.toBeDefined();

    const updatedRole = getRoleWithRemovedFieldPermission(
      role,
      BASE_FIELD_PERMISSION.fieldMetadataId,
    );

    expect(updatedRole.fieldPermissions).not.toBeDefined();
  });
});
