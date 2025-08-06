import { IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { getNonReadableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonReadableFieldMetadataIdsFromObjectPermissions';
import { getNonUpdatableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonUpdatableFieldMetadataIdsFromObjectPermissions';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import {
  ObjectMetadataItemsQuery,
  ObjectPermission,
} from '~/generated-metadata/graphql';
import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const mapPaginatedObjectMetadataItemsToObjectMetadataItems = ({
  pagedObjectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  pagedObjectMetadataItems: ObjectMetadataItemsQuery | undefined;
  objectPermissionsByObjectMetadataId: Record<string, ObjectPermission>;
}) => {
  const formattedObjects: ObjectMetadataItem[] =
    pagedObjectMetadataItems?.objects.edges.map((object) => {
      const objectPermissions =
        objectPermissionsByObjectMetadataId[object.node.id];

      const nonReadableFieldMetadataIds =
        getNonReadableFieldMetadataIdsFromObjectPermissions({
          objectPermissions: [objectPermissions],
          objectMetadataId: object.node.id,
        });

      const nonUpdatableFieldMetadataIds =
        getNonUpdatableFieldMetadataIdsFromObjectPermissions({
          objectPermissions: objectPermissions,
        });

      const labelIdentifierFieldMetadataId =
        objectMetadataItemSchema.shape.labelIdentifierFieldMetadataId.parse(
          object.node.labelIdentifierFieldMetadataId,
        );

      const { fieldsList, indexMetadataList, ...objectWithoutFieldsList } =
        object.node;

      return {
        ...objectWithoutFieldsList,
        fields: fieldsList,
        readableFields: fieldsList.filter(
          (field) => !nonReadableFieldMetadataIds.includes(field.id),
        ),
        updatableFields: fieldsList.filter(
          (field) => !nonUpdatableFieldMetadataIds.includes(field.id),
        ),
        labelIdentifierFieldMetadataId,
        indexMetadatas: indexMetadataList.map(
          (index) =>
            ({
              ...index,
              indexFieldMetadatas: index.indexFieldMetadataList.map(
                (indexFieldMetadata) =>
                  ({
                    ...indexFieldMetadata,
                  }) satisfies IndexFieldMetadataItem,
              ),
            }) satisfies IndexMetadataItem,
        ),
      } satisfies ObjectMetadataItem;
    }) ?? [];

  return formattedObjects;
};
