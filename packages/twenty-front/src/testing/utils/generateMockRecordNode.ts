import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

// Core primitive: creates a complete ObjectRecord from partial input
// by resolving mock metadata and filling all missing fields with defaults.
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

// Generates a GraphQL record node from partial input.
// Delegates to production getRecordNodeFromRecord with mock metadata.
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

// Generates a full GraphQL connection from partial input records.
// Delegates to production getRecordConnectionFromRecords with mock metadata.
export const generateMockRecordConnection = ({
  objectNameSingular,
  records,
  computeReferences = false,
}: {
  objectNameSingular: string;
  records: Record<string, unknown>[];
  computeReferences?: boolean;
}) => {
  const objectMetadataItem =
    getMockObjectMetadataItemOrThrow(objectNameSingular);

  const prefilledRecords = records.map((recordInput) =>
    generateMockRecord({ objectNameSingular, input: recordInput }),
  );

  return getRecordConnectionFromRecords({
    objectMetadataItems: generatedMockObjectMetadataItems,
    objectMetadataItem,
    records: prefilledRecords,
    computeReferences,
  });
};
