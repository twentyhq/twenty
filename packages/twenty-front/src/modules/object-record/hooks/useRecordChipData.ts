import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';

export const useRecordChipData = ({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: ObjectRecord;
}) => {
  const { identifierChipGeneratorPerObject } = useContext(
    PreComputedChipGeneratorsContext,
  );

  const generateRecordChipData =
    identifierChipGeneratorPerObject[objectNameSingular] ??
    generateDefaultRecordChipData;

  const recordChipData = generateRecordChipData(record);

  return { recordChipData };
};
