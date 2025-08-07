import { getNonReadableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonReadableFieldMetadataIdsFromObjectPermissions';
import { getNonUpdatableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonUpdatableFieldMetadataIdsFromObjectPermissions';
import { ObjectPermissions } from 'twenty-shared/types';
import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

type enrichObjectMetadataItemsWithPermissionsArgs = {
  objectMetadataItems: Omit<
    ObjectMetadataItem,
    'readableFields' | 'updatableFields'
  >[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};

export const enrichObjectMetadataItemsWithPermissions = ({
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: enrichObjectMetadataItemsWithPermissionsArgs) => {
  const formattedObjects: ObjectMetadataItem[] =
    objectMetadataItems.map((object) => {
      const objectPermissions = objectPermissionsByObjectMetadataId[object.id];

      const nonReadableFieldMetadataIds =
        getNonReadableFieldMetadataIdsFromObjectPermissions({
          objectPermissions: objectPermissions,
        });

      const nonUpdatableFieldMetadataIds =
        getNonUpdatableFieldMetadataIdsFromObjectPermissions({
          objectPermissions: objectPermissions,
        });

      const { fields, ...objectWithoutFields } = object;

      return {
        ...objectWithoutFields,
        fields: fields,
        readableFields: fields.filter(
          (field) => !nonReadableFieldMetadataIds.includes(field.id),
        ),
        updatableFields: fields.filter(
          (field) => !nonUpdatableFieldMetadataIds.includes(field.id),
        ),
      } satisfies ObjectMetadataItem;
    }) ?? [];

  return formattedObjects;
};
