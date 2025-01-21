import { isString } from '@sniptt/guards';
import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const mapPaginatedObjectMetadataItemsToObjectMetadataItems = ({
  pagedObjectMetadataItems,
}: {
  pagedObjectMetadataItems: ObjectMetadataItemsQuery | undefined;
}) => {
  const formattedObjects: ObjectMetadataItem[] =
    pagedObjectMetadataItems?.objects.edges.map((object) => {
      const {labelIdentifierFieldMetadataId} = object.node;
      // Could be zod parse tbh to gain grain on uuid parse
      if (!isString(labelIdentifierFieldMetadataId)) {
        throw new Error("Should never occurs, labelIdentifierFieldMetadataId is not a string")
      };

      return {
        ...object.node,
        fields: object.node.fields.edges.map((field) => field.node),
        labelIdentifierFieldMetadataId,
        indexMetadatas: object.node.indexMetadatas?.edges.map((index) => ({
          ...index.node,
          indexFieldMetadatas: index.node.indexFieldMetadatas?.edges.map(
            (indexField) => indexField.node,
          ),
        }))
      }
    }) ?? [];

  return formattedObjects;
};
