import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { generateMockRecord } from '~/testing/utils/generateMockRecordNode';

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
