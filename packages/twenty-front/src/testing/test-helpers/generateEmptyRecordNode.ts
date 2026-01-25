import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

type GenerateEmptyRecordNodeArgs = {
  objectNameSingular: string;
  input: Record<string, unknown>;
  withDepthOneRelation?: boolean;
};
export const generateEmptyRecordNode = ({
  objectNameSingular,
  input,
  withDepthOneRelation = false,
}: GenerateEmptyRecordNodeArgs) => {
  const objectMetadataItem =
    getMockObjectMetadataItemOrThrow(objectNameSingular);

  if (!objectMetadataItem) {
    throw new Error(
      `ObjectMetadataItem not found for objectNameSingular: ${objectNameSingular} while generating empty record node`,
    );
  }

  const prefilledRecord = prefillRecord({
    objectMetadataItem,
    input,
  });

  return getRecordNodeFromRecord({
    record: prefilledRecord,
    objectMetadataItem,
    objectMetadataItems: generatedMockObjectMetadataItems,
    recordGqlFields: withDepthOneRelation
      ? generateDepthRecordGqlFieldsFromObject({
          objectMetadataItem,
          objectMetadataItems: generatedMockObjectMetadataItems,
          depth: 1,
        })
      : undefined,
  });
};
