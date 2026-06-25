import { type IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type mapPaginatedObjectMetadataItemsToObjectMetadataItemsArgs = {
  pagedObjectMetadataItems: ObjectMetadataItemsQuery | undefined;
};

export const mapPaginatedObjectMetadataItemsToObjectMetadataItems = ({
  pagedObjectMetadataItems,
}: mapPaginatedObjectMetadataItemsToObjectMetadataItemsArgs) => {
  const formattedObjects: Omit<
    EnrichedObjectMetadataItem,
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
        fields: fieldsList.map((field) => ({
          ...field,
        })),
        labelIdentifierFieldMetadataId,
        indexMetadatas: indexMetadataList.map(
          ({ indexFieldMetadataList: indexFields, ...indexRest }) =>
            ({
              ...indexRest,
              indexFieldMetadatas: indexFields.map(
                (indexFieldMetadata) =>
                  ({
                    ...indexFieldMetadata,
                  }) satisfies IndexFieldMetadataItem,
              ),
            }) satisfies IndexMetadataItem,
        ),
      } satisfies Omit<
        EnrichedObjectMetadataItem,
        'readableFields' | 'updatableFields'
      >;
    }) ?? [];

  return formattedObjects;
};
