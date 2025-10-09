import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

type GenerateEmptyJestRecordNodeArgs = {
  objectNameSingular: string;
  input: Record<string, unknown>;
  withDepthOneRelation?: boolean;
};
export const generateEmptyJestRecordNode = ({
  objectNameSingular,
  input,
  withDepthOneRelation = false,
}: GenerateEmptyJestRecordNodeArgs) => {
  const objectMetadataItem =
    getMockObjectMetadataItemOrThrow(objectNameSingular);

  if (!objectMetadataItem) {
    throw new Error(
      `ObjectMetadataItem not found for objectNameSingular: ${objectNameSingular} while generating empty Jest record node`,
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
      ? generateDepthRecordGqlFields({
          objectMetadataItem,
          objectMetadataItems: generatedMockObjectMetadataItems,
          depth: 1,
        })
      : undefined,
  });
};
