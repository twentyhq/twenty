import { useContext } from 'react';

import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { FieldContext } from '../../contexts/FieldContext';
import { type FieldCurrencyValue } from '../../types/FieldMetadata';

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
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
