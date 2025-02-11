import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/mock-metadata-query-result';

export const generatedMockObjectMetadataItems: ObjectMetadataItem[] =
  mockedStandardObjectMetadataQueryResult.objects.edges.map((edge) => {
    const labelIdentifierFieldMetadataId =
      objectMetadataItemSchema.shape.labelIdentifierFieldMetadataId.parse(
        edge.node.labelIdentifierFieldMetadataId,
      );

    const { fieldsList, ...objectWithoutFieldsList } = edge.node;

    return {
      ...objectWithoutFieldsList,
      fields: fieldsList,
      labelIdentifierFieldMetadataId,
      indexMetadatas: edge.node.indexMetadatas.edges.map((index) => ({
        ...index.node,
        indexFieldMetadatas: index.node.indexFieldMetadatas?.edges.map(
          (indexField) => indexField.node,
        ),
      })),
    };
  });
