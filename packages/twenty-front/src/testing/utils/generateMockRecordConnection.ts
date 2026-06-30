import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { generateMockRecord } from '~/testing/utils/generateMockRecord';

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
    objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
    objectMetadataItem,
    records: prefilledRecords,
    computeReferences,
  });
};
