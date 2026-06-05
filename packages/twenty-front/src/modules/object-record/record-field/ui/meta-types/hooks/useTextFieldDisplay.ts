import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';

const parseTextFieldValue = (fieldValue: unknown): string => {
  if (isNonEmptyString(fieldValue)) {
    return fieldValue;
  }

  if (isFieldFullNameValue(fieldValue)) {
    return [fieldValue.firstName, fieldValue.lastName]
      .filter(isNonEmptyString)
      .join(' ');
  }

  return '';
};

export const useTextFieldDisplay = () => {
  const { recordId, fieldDefinition, displayedMaxRows } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = parseTextFieldValue(
    useRecordFieldValue<unknown>(recordId, fieldName, fieldDefinition),
  );

  return {
    fieldDefinition,
    fieldValue,
    displayedMaxRows,
  };
};
