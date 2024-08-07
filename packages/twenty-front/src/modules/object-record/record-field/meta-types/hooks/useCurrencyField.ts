import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';

import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { FieldCurrencyValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldCurrency } from '../../types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '../../types/guards/isFieldCurrencyValue';

export const useCurrencyField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.Currency,
    isFieldCurrency,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldCurrencyValue>(
    recordStoreFamilySelector({
      recordId,
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
    const amount = parseFloat(amountText);

    const newCurrencyValue = {
      amountMicros: isNaN(amount)
        ? null
        : convertCurrencyAmountToCurrencyMicros(amount),
      currencyCode,
    };

    if (!isFieldCurrencyValue(newCurrencyValue)) {
      return;
    }
    persistField(newCurrencyValue);
  };

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldCurrencyValue>(`${recordId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

  const defaultValue = fieldDefinition.defaultValue;

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
    persistCurrencyField,
    defaultValue,
  };
};
