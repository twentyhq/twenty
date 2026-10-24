import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectsPermissions } from 'twenty-shared/types';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const assertTimelineActivityPropertiesAreQueryableOrThrow = ({
  objectsPermissions,
  fieldMetadata,
}: {
  objectsPermissions: ObjectsPermissions | undefined;
  fieldMetadata: Pick<OrmFlatFieldMetadata, 'universalIdentifier'>;
}): void => {
  if (
    fieldMetadata.universalIdentifier !==
    STANDARD_OBJECTS.timelineActivity.fields.properties.universalIdentifier
  ) {
    return;
  }

  const hasReadDeniedField = Object.values(objectsPermissions ?? {}).some(
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
