import { IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const mapPaginatedObjectMetadataItemsToObjectMetadataItems = ({
  pagedObjectMetadataItems,
}: {
  pagedObjectMetadataItems: ObjectMetadataItemsQuery | undefined;
}) => {
  const formattedObjects: ObjectMetadataItem[] =
    pagedObjectMetadataItems?.objects.edges.map((object) => {
      const labelIdentifierFieldMetadataId =
        objectMetadataItemSchema.shape.labelIdentifierFieldMetadataId.parse(
          object.node.labelIdentifierFieldMetadataId,
        );

      const { fieldsList, indexMetadataList, ...objectWithoutFieldsList } =
        object.node;

      return {
        ...objectWithoutFieldsList,
        fields: fieldsList,
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
