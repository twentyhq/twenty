import { useContext } from 'react';

import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useTableValueRecord } from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

import { FieldContext } from '../../contexts/FieldContext';

export const useChipField = () => {
  const { recordChipDataGeneratorPerFieldName } =
    useContext(RecordTableContext);
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const objectNameSingular =
    isFieldText(fieldDefinition) ||
    isFieldFullName(fieldDefinition) ||
    isFieldNumber(fieldDefinition)
      ? fieldDefinition.metadata.objectMetadataNameSingular
      : undefined;

  const record = useTableValueRecord(entityId) as ObjectRecord;

  const generateRecordChipData =
    recordChipDataGeneratorPerFieldName[fieldDefinition.metadata.fieldName];

  return {
    objectNameSingular,
    record,
    generateRecordChipData,
  };
};
