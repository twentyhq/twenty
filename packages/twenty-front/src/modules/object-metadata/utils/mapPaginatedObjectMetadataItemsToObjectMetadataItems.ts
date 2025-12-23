import { type IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type mapPaginatedObjectMetadataItemsToObjectMetadataItemsArgs = {
  pagedObjectMetadataItems: ObjectMetadataItemsQuery | undefined;
};

export const mapPaginatedObjectMetadataItemsToObjectMetadataItems = ({
  pagedObjectMetadataItems,
}: mapPaginatedObjectMetadataItemsToObjectMetadataItemsArgs) => {
  const formattedObjects: Omit<
    ObjectMetadataItem,
    'readableFields' | 'updatableFields'
  >[] =
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
      } satisfies Omit<
        ObjectMetadataItem,
        'readableFields' | 'updatableFields'
      >;
    }) ?? [];

  return formattedObjects;
};
