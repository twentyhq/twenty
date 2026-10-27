import { type ObjectsPermissions } from 'twenty-shared/types';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertTimelineActivityPropertiesAreQueryableOrThrow } from 'src/modules/timeline/utils/assert-timeline-activity-properties-are-queryable-or-throw.util';

// Filtering or ordering by a non-readable field would leak its values (orderBy embeds them into cursors)
export const assertFieldIsReadableOrThrow = ({
  objectsPermissions,
  flatObjectMetadata,
  flatFieldMetadata,
}: {
  objectsPermissions: ObjectsPermissions | undefined;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
  flatFieldMetadata: Pick<OrmFlatFieldMetadata, 'id' | 'name'>;
}): void => {
  if (
    objectsPermissions?.[flatObjectMetadata.id]?.restrictedFields[
      flatFieldMetadata.id
    ]?.canRead === false
  ) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  assertTimelineActivityPropertiesAreQueryableOrThrow({
    objectNameSingular: flatObjectMetadata.nameSingular,
    fieldName: flatFieldMetadata.name,
    objectsPermissions,
  });
};
