import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordChipData } from '@/object-record/record-field/types/RecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
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

  const { fieldDefinition } = useContext(FieldContext);
  const updatedRecord = { ...record };

  if (fieldDefinition?.type === FieldMetadataType.FULL_NAME) {
    updatedRecord.name = record[fieldDefinition.metadata.fieldName];
  }

  const identifierChipGenerator =
    identifierChipGeneratorPerObject[objectNameSingular];

  if (isDefined(identifierChipGenerator)) {
    return {
      recordChipData: identifierChipGenerator(updatedRecord),
    };
  }

  return {
    recordChipData: generateDefaultRecordChipData({
      objectNameSingular,
      record: updatedRecord,
    }),
  };
};
