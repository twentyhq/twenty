import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { type RecordChipData } from '@/object-record/record-field/ui/types/RecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
