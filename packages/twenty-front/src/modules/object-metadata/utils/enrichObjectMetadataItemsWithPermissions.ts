import { getNonReadableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonReadableFieldMetadataIdsFromObjectPermissions';
import { getNonUpdatableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonUpdatableFieldMetadataIdsFromObjectPermissions';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ObjectPermissions } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type enrichObjectMetadataItemsWithPermissionsArgs = {
  objectMetadataItems: Omit<
    EnrichedObjectMetadataItem,
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
  const formattedObjects: EnrichedObjectMetadataItem[] =
    objectMetadataItems.map((object) => {
      const objectPermissions = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        object.id,
      );

      const nonReadableFieldMetadataIds =
        getNonReadableFieldMetadataIdsFromObjectPermissions({
          objectPermissions,
        });

      const nonUpdatableFieldMetadataIds =
        getNonUpdatableFieldMetadataIdsFromObjectPermissions({
          objectPermissions,
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
      } satisfies EnrichedObjectMetadataItem;
    }) ?? [];

  return formattedObjects;
};
