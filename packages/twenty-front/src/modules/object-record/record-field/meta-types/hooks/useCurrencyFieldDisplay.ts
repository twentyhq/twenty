import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { FieldMetadataType } from 'twenty-shared/types';
import { FieldContext } from '../../contexts/FieldContext';
import { FieldCurrencyValue } from '../../types/FieldMetadata';

export const useCurrencyFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.CURRENCY,
    isFieldCurrency,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldCurrencyValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
