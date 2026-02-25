import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/mock-metadata-query-result';

// TODO: remove once we have a way to generate the mocks against a seeded workspace
const addUniversalIdentifierToField = (
  field: Record<string, unknown>,
): FieldMetadataItem => ({
  ...(field as FieldMetadataItem),
  universalIdentifier:
    (field as { universalIdentifier?: string }).universalIdentifier ??
    (field as { id: string }).id,
});

export const generatedMockObjectMetadataItems: ObjectMetadataItem[] =
  mockedStandardObjectMetadataQueryResult.objects.edges.map((edge) => {
    const labelIdentifierFieldMetadataId =
      objectMetadataItemSchema.shape.labelIdentifierFieldMetadataId.parse(
        edge.node.labelIdentifierFieldMetadataId,
      );

    const { fieldsList, indexMetadataList, ...objectWithoutFieldsList } =
      edge.node;

    const fields = fieldsList.map(addUniversalIdentifierToField);

    return {
      ...objectWithoutFieldsList,
      universalIdentifier:
        (objectWithoutFieldsList as { universalIdentifier?: string })
          .universalIdentifier ?? objectWithoutFieldsList.id,
      fields,
      readableFields: fields,
      updatableFields: fields,
      labelIdentifierFieldMetadataId,
      indexMetadatas: indexMetadataList.map((index) => ({
        ...index,
        indexFieldMetadatas: [],
      })),
    };
  });
