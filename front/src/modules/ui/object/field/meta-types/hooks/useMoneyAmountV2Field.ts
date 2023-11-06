import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldMoneyAmountV2Value } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldMoneyAmountV2 } from '../../types/guards/isFieldMoneyAmountV2';
import { isFieldMoneyAmountV2Value } from '../../types/guards/isFieldMoneyAmountV2Value';

export const useMoneyAmountV2Field = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('MONEY_AMOUNT_V2', isFieldMoneyAmountV2, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldMoneyAmountV2Value>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistMoneyAmountV2Field = (newValue: FieldMoneyAmountV2Value) => {
    if (!isFieldMoneyAmountV2Value(newValue)) {
      return;
    }

    persistField(newValue);
  };

  const fieldInitialValue = useFieldInitialValue();

  const initialValue: FieldMoneyAmountV2Value = fieldInitialValue?.isEmpty
    ? { amount: 0, currency: '' }
    : !isNaN(Number(fieldInitialValue?.value))
    ? { amount: Number(fieldInitialValue?.value), currency: '' }
    : { amount: 0, currency: '' } ?? fieldValue;

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
    persistMoneyAmountV2Field,
  };
};
