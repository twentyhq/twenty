import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/standard-metadata-query-result';

export const generatedMockObjectMetadataItems: ObjectMetadataItem[] =
  mockedStandardObjectMetadataQueryResult.objects.edges.map((edge) => ({
    ...edge.node,
    fields: edge.node.fields.edges.map((edge) => edge.node),
  }));
