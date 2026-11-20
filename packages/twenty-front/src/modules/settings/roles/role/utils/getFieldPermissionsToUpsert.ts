import { isFieldPermissionRestrictive } from '@/settings/roles/role-permissions/field-permissions/utils/isFieldPermissionRestrictive';
import { isDefined } from 'twenty-shared/utils';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const getFieldPermissionsToUpsert = ({
  dirtyFieldPermissions,
  persistedFieldPermissions,
}: {
  dirtyFieldPermissions: FieldPermission[];
  persistedFieldPermissions: FieldPermission[];
}): FieldPermission[] =>
  dirtyFieldPermissions.filter((dirtyFieldPermission) => {
    const persistedFieldPermission = persistedFieldPermissions.find(
      ({ fieldMetadataId }) =>
        fieldMetadataId === dirtyFieldPermission.fieldMetadataId,
    );

    if (!isDefined(persistedFieldPermission)) {
      return isFieldPermissionRestrictive(dirtyFieldPermission);
    }

    return (
      dirtyFieldPermission.canReadFieldValue !==
        persistedFieldPermission.canReadFieldValue ||
      dirtyFieldPermission.canUpdateFieldValue !==
        persistedFieldPermission.canUpdateFieldValue
    );
  });
