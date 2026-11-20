import { getFieldPermissionsToUpsert } from '@/settings/roles/role/utils/getFieldPermissionsToUpsert';
import { type FieldPermission } from '~/generated-metadata/graphql';

const buildFieldPermission = ({
  fieldMetadataId,
  canReadFieldValue,
  canUpdateFieldValue,
}: {
  fieldMetadataId: string;
  canReadFieldValue: boolean | null;
  canUpdateFieldValue: boolean | null;
}): FieldPermission => ({
  id: `${fieldMetadataId}-permission`,
  roleId: 'role-id',
  objectMetadataId: 'company',
  fieldMetadataId,
  canReadFieldValue,
  canUpdateFieldValue,
});

describe('getFieldPermissionsToUpsert', () => {
  it('should send new restrictions and changed field permissions only', () => {
    const fieldPermissionsToUpsert = getFieldPermissionsToUpsert({
      dirtyFieldPermissions: [
        buildFieldPermission({
          fieldMetadataId: 'new-restriction',
          canReadFieldValue: true,
          canUpdateFieldValue: false,
        }),
        buildFieldPermission({
          fieldMetadataId: 'new-without-restriction',
          canReadFieldValue: null,
          canUpdateFieldValue: true,
        }),
        buildFieldPermission({
          fieldMetadataId: 'changed',
          canReadFieldValue: null,
          canUpdateFieldValue: null,
        }),
        buildFieldPermission({
          fieldMetadataId: 'unchanged',
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        }),
      ],
      persistedFieldPermissions: [
        buildFieldPermission({
          fieldMetadataId: 'changed',
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        }),
        buildFieldPermission({
          fieldMetadataId: 'unchanged',
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        }),
      ],
    });

    expect(
      fieldPermissionsToUpsert.map(({ fieldMetadataId }) => fieldMetadataId),
    ).toEqual(['new-restriction', 'changed']);
  });
});
