import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type RoleSaveSubmission } from '@/settings/roles/role/types/RoleSaveSubmission';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { newFieldPermissionsFilter } from '@/settings/roles/role/utils/newFieldPermissionsFilter';

export const buildRoleSaveSnapshotOrThrow = ({
  draftRole,
  persistedRole,
}: RoleSaveSubmission) => {
  const hasMatchingRoleIdentity =
    !isDefined(persistedRole) || persistedRole.id === draftRole.id;

  if (!isNonEmptyString(draftRole.id) || !hasMatchingRoleIdentity) {
    throw new CustomError(
      t`The role changed while editing. Reload the page and try again.`,
    );
  }

  const persistedFieldMetadataIds = new Set(
    persistedRole?.fieldPermissions?.map(
      ({ fieldMetadataId }) => fieldMetadataId,
    ),
  );
  const fieldPermissions = draftRole.fieldPermissions?.filter(
    ({ fieldMetadataId, canReadFieldValue, canUpdateFieldValue }) =>
      persistedFieldMetadataIds.has(fieldMetadataId) ||
      canReadFieldValue === false ||
      canUpdateFieldValue === false,
  );
  const normalizedDraftRole = { ...draftRole, fieldPermissions };
  const dirtyFields = getRoleDirtyFields(normalizedDraftRole, persistedRole);
  const fieldPermissionsToUpsert =
    dirtyFields.fieldPermissions?.filter((fieldPermission) =>
      newFieldPermissionsFilter(
        fieldPermission,
        persistedRole?.fieldPermissions,
      ),
    ) ?? [];

  return {
    roleId: normalizedDraftRole.id,
    isCreateMode: !isDefined(persistedRole),
    draftRole: normalizedDraftRole,
    persistedRole,
    dirtyFields,
    fieldPermissionsToUpsert,
  };
};
