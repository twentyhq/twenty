import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
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

    const fields = fieldsList.map(
      (field) => field as unknown as FieldMetadataItem,
    );

    return {
      ...objectWithoutFieldsList,
      fields,
      readableFields: fields,
      updatableFields: fields,
      labelIdentifierFieldMetadataId,
      indexMetadatas: indexMetadataList.map(
        ({ indexFieldMetadataList, ...index }) => ({
          ...index,
          indexFieldMetadatas: indexFieldMetadataList,
        }),
      ),
    };
  });
