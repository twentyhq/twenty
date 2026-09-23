import { reconcileRoleDraft } from '@/settings/roles/role/utils/reconcileRoleDraft';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { getDirtyFields } from '~/utils/getDirtyFields';

const emptyRole = {
  ...mockedRoles[1],
  fieldPermissions: [],
  objectPermissions: [],
};

describe('reconcileRoleDraft', () => {
  it('merges concurrent field edits by field identity while retaining canonical IDs', () => {
    const fieldPermission = {
      id: 'temporary-id',
      roleId: 'role-id',
      objectMetadataId: 'object-id',
      fieldMetadataId: 'field-id',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    };
    const baselineRole = { ...emptyRole, fieldPermissions: [fieldPermission] };
    const savedPermission = {
      ...fieldPermission,
      id: 'server-id',
      __typename: 'FieldPermission' as const,
    };
    const savedRole = { ...emptyRole, fieldPermissions: [savedPermission] };
    const draftRole = {
      ...baselineRole,
      fieldPermissions: [{ ...fieldPermission, canReadFieldValue: true }],
    };

    const reconciledRole = reconcileRoleDraft({
      savedRole,
      baselineRole,
      draftRole,
    });

    expect(reconciledRole.fieldPermissions).toEqual([
      { ...savedPermission, canReadFieldValue: true },
    ]);
    expect(
      getDirtyFields(
        {
          ...reconciledRole,
          fieldPermissions: reconciledRole.fieldPermissions?.map(
            (permission) => ({ ...permission, canReadFieldValue: false }),
          ),
        },
        savedRole,
      ),
    ).toEqual({});
  });

  it('preserves refreshed object metadata while applying concurrent permission changes', () => {
    const objectPermission = {
      objectMetadataId: 'object-id',
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
    };
    const baselineRole = {
      ...emptyRole,
      objectPermissions: [objectPermission],
    };
    const savedRole = {
      ...baselineRole,
      objectPermissions: [
        { ...objectPermission, restrictedFields: ['field-id'] },
      ],
    };

    expect(
      reconcileRoleDraft({
        savedRole,
        baselineRole,
        draftRole: {
          ...baselineRole,
          objectPermissions: [
            { ...objectPermission, canUpdateObjectRecords: true },
          ],
        },
      }).objectPermissions,
    ).toEqual([
      { ...savedRole.objectPermissions[0], canUpdateObjectRecords: true },
    ]);
  });

  it('preserves absent collections when no collection changes remain', () => {
    const savedRole = {
      ...emptyRole,
      fieldPermissions: null,
      objectPermissions: undefined,
    };

    expect(
      getDirtyFields(
        reconcileRoleDraft({
          savedRole,
          baselineRole: emptyRole,
          draftRole: emptyRole,
        }),
        savedRole,
      ),
    ).toEqual({});
  });
});
