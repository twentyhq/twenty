import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { CurrencyCode } from '@/object-record/field/types/CurrencyCode';
import { FieldInitialValue } from '@/object-record/field/types/FieldInitialValue';
import { canBeCastAsIntegerOrNull } from '~/utils/cast-as-integer-or-null';
import {
  convertCurrencyMicrosToCurrency,
  convertCurrencyToCurrencyMicros,
} from '~/utils/convert-currency-amount';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldCurrencyValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldCurrency } from '../../types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '../../types/guards/isFieldCurrencyValue';

const initializeValue = (
  fieldInitialValue: FieldInitialValue | undefined,
  fieldValue: FieldCurrencyValue,
) => {
  if (fieldInitialValue?.isEmpty) {
    return { amount: null, currencyCode: CurrencyCode.USD };
  }
  if (!isNaN(Number(fieldInitialValue?.value))) {
    return {
      amount: Number(fieldInitialValue?.value),
      currencyCode: CurrencyCode.USD,
    };
  }

  if (!fieldValue) {
    return { amount: null, currencyCode: CurrencyCode.USD };
  }

  return {
    amount: convertCurrencyMicrosToCurrency(fieldValue.amountMicros),
    currencyCode: CurrencyCode.USD,
  };
};

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

  const persistCurrencyField = ({
    amountText,
    currencyCode,
  }: {
    amountText: string;
    currencyCode: string;
  }) => {
    if (!canBeCastAsIntegerOrNull(amountText)) {
      return;
    }
    const amount = parseFloat(amountText);

    const newCurrencyValue = {
      amountMicros: isNaN(amount)
        ? null
        : convertCurrencyToCurrencyMicros(amount),
      currencyCode,
    };

    if (!isFieldCurrencyValue(newCurrencyValue)) {
      return;
    }
    persistField(newCurrencyValue);
  };

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = initializeValue(fieldInitialValue, fieldValue);

  const initialAmount = initialValue.amount;
  const initialCurrencyCode = initialValue.currencyCode;

  return {
    fieldDefinition,
    fieldValue,
    initialAmount,
    initialCurrencyCode,
    setFieldValue,
    hotkeyScope,
    persistCurrencyField,
  };
};
