import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { RecordChipData } from '@/object-record/record-field/types/RecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared';

type UseRecordChipDataArgs = {
  objectNameSingular: string;
  record: ObjectRecord;
};
type UseRecordChipDataReturnType = {
  recordChipData: RecordChipData;
};
export const useRecordChipData = ({
  objectNameSingular,
  record,
}: UseRecordChipDataArgs): UseRecordChipDataReturnType => {
  const { identifierChipGeneratorPerObject } = useContext(
    PreComputedChipGeneratorsContext,
  );

  const identifierChipGenerator =
    identifierChipGeneratorPerObject[objectNameSingular];
  if (isDefined(identifierChipGenerator)) {
    return {
      recordChipData: identifierChipGenerator(record),
    };
  }

  return {
    recordChipData: generateDefaultRecordChipData({
      objectNameSingular,
      record,
    }),
  };
};
