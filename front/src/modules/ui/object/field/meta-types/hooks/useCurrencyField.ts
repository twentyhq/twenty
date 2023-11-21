import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldCurrencyValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldCurrency } from '../../types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '../../types/guards/isFieldCurrencyValue';

export const useCurrencyField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('CURRENCY', isFieldCurrency, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldCurrencyValue>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistCurrencyField = (newValue: FieldCurrencyValue) => {
    if (!isFieldCurrencyValue(newValue)) {
      return;
    }

    persistField(newValue);
  };

  const fieldInitialValue = useFieldInitialValue();

  const initialValue: FieldCurrencyValue = fieldInitialValue?.isEmpty
    ? { amountMicros: 0, currencyCode: '' }
    : !isNaN(Number(fieldInitialValue?.value))
    ? { amountMicros: Number(fieldInitialValue?.value), currencyCode: '' }
    : { amountMicros: 0, currencyCode: '' } ?? fieldValue;

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
    persistCurrencyField,
  };
};
