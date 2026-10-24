import { type ObjectsPermissions } from 'twenty-shared/types';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { FIELD_VALUE_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/permissions/constants/field-value-snapshot-field-universal-identifiers.constant';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const assertFieldValueSnapshotIsQueryableOrThrow = ({
  objectsPermissions,
  fieldMetadata,
}: {
  objectsPermissions: ObjectsPermissions;
  fieldMetadata: Pick<OrmFlatFieldMetadata, 'universalIdentifier'>;
}): void => {
  if (
    !FIELD_VALUE_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIERS.has(
      fieldMetadata.universalIdentifier,
    )
  ) {
    return;
  }

  const hasReadDeniedField = Object.values(objectsPermissions).some(
    (objectPermissions) =>
      Object.values(objectPermissions.restrictedFields).some(
        (fieldPermissions) => fieldPermissions.canRead === false,
      ),
  );

  if (hasReadDeniedField) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
};
