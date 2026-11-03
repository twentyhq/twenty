import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { buildRoleSaveSnapshotOrThrow } from '@/settings/roles/role/utils/buildRoleSaveSnapshotOrThrow';

const PERSISTED_PERMISSION = {
  id: 'existing-permission',
  roleId: 'assigned-role',
  fieldMetadataId: 'existing-field',
  objectMetadataId: 'object',
  canReadFieldValue: false,
  canUpdateFieldValue: false,
};

const PERSISTED_ROLE = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: 'assigned-role',
  label: 'Assigned agent role',
  fieldPermissions: [PERSISTED_PERMISSION],
};

describe('buildRoleSaveSnapshotOrThrow', () => {
  it('preserves existing permission resets and new restrictions without changing the submitted draft', () => {
    const existingPermissionReset = {
      ...PERSISTED_PERMISSION,
      canReadFieldValue: true,
      canUpdateFieldValue: true,
    };
    const newRestriction = {
      ...PERSISTED_PERMISSION,
      id: 'new-restriction',
      fieldMetadataId: 'restricted-field',
    };
    const unnecessaryPermission = {
      ...existingPermissionReset,
      id: 'unnecessary-permission',
      fieldMetadataId: 'unrestricted-field',
    };
    const draftRole = {
      ...PERSISTED_ROLE,
      fieldPermissions: [
        existingPermissionReset,
        newRestriction,
        unnecessaryPermission,
      ],
    };

    const snapshot = buildRoleSaveSnapshotOrThrow({
      draftRole,
      persistedRole: PERSISTED_ROLE,
    });

    expect(snapshot.isCreateMode).toBe(false);
    expect(snapshot.roleId).toBe('assigned-role');
    expect(snapshot.draftRole.fieldPermissions).toEqual([
      existingPermissionReset,
      newRestriction,
    ]);
    expect(snapshot.fieldPermissionsToUpsert).toEqual([
      existingPermissionReset,
      newRestriction,
    ]);
    expect(draftRole.fieldPermissions).toEqual([
      existingPermissionReset,
      newRestriction,
      unnecessaryPermission,
    ]);
  });

  it('rejects a captured draft for a different assigned role', () => {
    expect(() =>
      buildRoleSaveSnapshotOrThrow({
        draftRole: { ...PERSISTED_ROLE, id: 'previous-local-role' },
        persistedRole: PERSISTED_ROLE,
      }),
    ).toThrow('The role changed while editing. Reload the page and try again.');
  });
});
