import { useContext } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/context/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { useRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { isDefined } from '~/utils/isDefined';

import { FieldContext } from '../../contexts/FieldContext';

export const useChipFieldDisplay = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const { viewBarId } = useContext(RecordTableContext);
  const { currentViewIdState } = useViewStates(viewBarId);

  const currentViewId = useRecoilValue(currentViewIdState);

  const { chipGeneratorPerObjectPerField } = useContext(
    PreComputedChipGeneratorsContext,
  );

  if (!isDefined(chipGeneratorPerObjectPerField)) {
    throw new Error('Chip generator per object per field is not defined');
  }

  const objectNameSingular =
    isFieldText(fieldDefinition) ||
    isFieldFullName(fieldDefinition) ||
    isFieldNumber(fieldDefinition)
      ? fieldDefinition.metadata.objectMetadataNameSingular
      : undefined;

  const recordValue = useRecordValue(entityId);

  if (!isNonEmptyString(fieldDefinition.metadata.objectMetadataNameSingular)) {
    throw new Error('Object metadata name singular is not a non-empty string');
  }

  const generateRecordChipData =
    chipGeneratorPerObjectPerField[
      fieldDefinition.metadata.objectMetadataNameSingular
    ]?.[fieldDefinition.metadata.fieldName] ?? generateDefaultRecordChipData;

  const formatRecordChipData = (record: ObjectRecord) => {
    const recordChipData = generateRecordChipData(record);
    recordChipData.linkToShowPage = `${recordChipData.linkToShowPage}${
      currentViewId ? `?view=${currentViewId}` : ''
    }`;
    return recordChipData;
  };

  return {
    objectNameSingular,
    recordValue,
    generateRecordChipData: formatRecordChipData,
  };
};
