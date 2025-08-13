import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/mock-metadata-query-result';

export const generatedMockObjectMetadataItems: ObjectMetadataItem[] =
  mockedStandardObjectMetadataQueryResult.objects.edges.map((edge) => {
    const labelIdentifierFieldMetadataId =
      objectMetadataItemSchema.shape.labelIdentifierFieldMetadataId.parse(
        edge.node.labelIdentifierFieldMetadataId,
      );

    const { fieldsList, indexMetadataList, ...objectWithoutFieldsList } =
      edge.node;

    return {
      ...objectWithoutFieldsList,
      fields: fieldsList,
      readableFields: fieldsList,
      updatableFields: fieldsList,
      labelIdentifierFieldMetadataId,
      indexMetadatas: indexMetadataList.map((index) => ({
        ...index,
        indexFieldMetadatas: [],
      })),
    };
  });
