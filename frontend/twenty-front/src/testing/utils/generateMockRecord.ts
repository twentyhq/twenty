import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
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
