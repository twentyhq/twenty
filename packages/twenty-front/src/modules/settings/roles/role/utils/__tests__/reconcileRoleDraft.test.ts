import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { reconcileRoleDraft } from '@/settings/roles/role/utils/reconcileRoleDraft';

const baseRole = { ...DEFAULT_SETTINGS_DRAFT_ROLE, id: 'role-id' };
const fieldPermission = {
  id: 'local-permission',
  roleId: baseRole.id,
  objectMetadataId: 'object-id',
  fieldMetadataId: 'field-id',
  canReadFieldValue: false,
  canUpdateFieldValue: false,
};

describe('reconcileRoleDraft', () => {
  it('acknowledges confirmed permission writes while retaining failed and later changes', () => {
    const submittedRole = {
      ...baseRole,
      canReadAllObjectRecords: true,
      fieldPermissions: [fieldPermission],
    };
    const persistedRole = { ...baseRole, canReadAllObjectRecords: true };
    const draftRole = { ...submittedRole, canUpdateAllObjectRecords: true };
    const result = reconcileRoleDraft({
      draftRole,
      baseRole,
      persistedRole,
      submittedRole,
    });

    expect(getRoleDirtyFields({ draftRole: result, persistedRole })).toEqual({
      canUpdateAllObjectRecords: true,
      fieldPermissions: [fieldPermission],
    });
    expect(baseRole.canReadAllObjectRecords).toBe(false);
  });

  it('preserves a newer permission reset and ignores generated permission metadata', () => {
    const submittedRole = { ...baseRole, fieldPermissions: [fieldPermission] };
    const persistedRole = {
      ...submittedRole,
      fieldPermissions: [
        {
          ...fieldPermission,
          id: 'server-permission',
          __typename: 'FieldPermission' as const,
        },
      ],
    };
    const resetPermission = {
      ...fieldPermission,
      canReadFieldValue: true,
      canUpdateFieldValue: true,
    };
    const result = reconcileRoleDraft({
      draftRole: { ...baseRole, fieldPermissions: [resetPermission] },
      baseRole,
      persistedRole,
      submittedRole,
    });

    expect(
      getRoleDirtyFields({ draftRole: submittedRole, persistedRole }),
    ).toEqual({});
    expect(result.fieldPermissions).toEqual([resetPermission]);
    expect(getRoleDirtyFields({ draftRole: result, persistedRole })).toEqual({
      fieldPermissions: [resetPermission],
    });
  });
});

it('preserves a matching new-role draft on its first persisted refresh', () => {
  const draftRole = {
    ...baseRole,
    label: 'Edited during creation',
    canAccessAllTools: true,
    fieldPermissions: [fieldPermission],
  };
  const result = reconcileRoleDraft({
    draftRole,
    baseRole: undefined,
    persistedRole: { ...baseRole, label: 'Submitted role' },
  });

  expect(result.label).toBe(draftRole.label);
  expect(result.canAccessAllTools).toBe(true);
  expect(result.fieldPermissions).toEqual([fieldPermission]);
});
