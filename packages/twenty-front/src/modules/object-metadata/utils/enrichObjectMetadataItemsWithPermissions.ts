import { getNonReadableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonReadableFieldMetadataIdsFromObjectPermissions';
import { getNonUpdatableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonUpdatableFieldMetadataIdsFromObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

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
      const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId,
        objectMetadataId: object.id,
      });

      const nonReadableFieldMetadataIds = !isDefined(objectPermissions)
        ? []
        : getNonReadableFieldMetadataIdsFromObjectPermissions({
            objectPermissions: objectPermissions,
          });

      const nonUpdatableFieldMetadataIds = !isDefined(objectPermissions)
        ? []
        : getNonUpdatableFieldMetadataIdsFromObjectPermissions({
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
