import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { generateMockRecord } from '~/testing/utils/generateMockRecord';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export const generateMockRecordNode = ({
  objectNameSingular,
  input,
  withDepthOneRelation = false,
  computeReferences,
}: {
  objectNameSingular: string;
  input: Record<string, unknown>;
  withDepthOneRelation?: boolean;
  computeReferences?: boolean;
}) => {
  const objectMetadataItem =
    getMockObjectMetadataItemOrThrow(objectNameSingular);

  const record = generateMockRecord({ objectNameSingular, input });

  return getRecordNodeFromRecord({
    record,
    objectMetadataItem,
    objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
    computeReferences,
    recordGqlFields: withDepthOneRelation
      ? generateDepthRecordGqlFieldsFromObject({
          objectMetadataItem,
          objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
          depth: 1,
        })
      : undefined,
  });
};
