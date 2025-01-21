import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/mock-metadata-query-result';

export const generatedMockObjectMetadataItems: ObjectMetadataItem[] =
  mockedStandardObjectMetadataQueryResult.objects.edges.map((edge) => ({
    ...edge.node,
    fields: edge.node.fields.edges.map((edge) => edge.node),
    labelIdentifierFieldMetadataId: edge.node.labelIdentifierFieldMetadataId as string,
    indexMetadatas: edge.node.indexMetadatas.edges.map((index) => ({
      ...index.node,
      indexFieldMetadatas: index.node.indexFieldMetadatas?.edges.map(
        (indexField) => indexField.node,
      ),
    })),
  }));
