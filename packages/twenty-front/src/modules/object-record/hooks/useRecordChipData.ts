import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
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

  if (!isDefined(identifierChipGenerator)) {
    throw new Error(
      // Error text is used for locale-independent issue grouping.
      // oxlint-disable-next-line lingui/no-unlocalized-strings
      `No identifier chip generator found for object name singular: ${objectNameSingular}`,
    );
  }

  return {
    recordChipData: identifierChipGenerator(record),
  };
};
