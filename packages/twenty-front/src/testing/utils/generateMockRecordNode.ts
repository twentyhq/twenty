import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export const generateMockRecord = ({
  objectNameSingular,
  input,
}: {
  objectNameSingular: string;
  input: Record<string, unknown>;
}): ObjectRecord => {
  const objectMetadataItem =
    getMockObjectMetadataItemOrThrow(objectNameSingular);

  return prefillRecord({ objectMetadataItem, input });
};

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
    objectMetadataItems: generatedMockObjectMetadataItems,
    computeReferences,
    recordGqlFields: withDepthOneRelation
      ? generateDepthRecordGqlFieldsFromObject({
          objectMetadataItem,
          objectMetadataItems: generatedMockObjectMetadataItems,
          depth: 1,
        })
      : undefined,
  });
};
