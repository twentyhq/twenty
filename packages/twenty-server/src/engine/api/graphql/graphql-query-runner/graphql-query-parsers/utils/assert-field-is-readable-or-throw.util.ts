import { type ObjectsPermissions } from 'twenty-shared/types';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

// Filtering or ordering by a field leaks its values (orderBy embeds them into cursors)
export const assertFieldIsReadableOrThrow = ({
  objectsPermissions,
  objectMetadataId,
  fieldMetadataId,
}: {
  objectsPermissions: ObjectsPermissions | undefined;
  objectMetadataId: string;
  fieldMetadataId: string;
}): void => {
  if (
    objectsPermissions?.[objectMetadataId]?.restrictedFields[fieldMetadataId]
      ?.canRead === false
  ) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
};
