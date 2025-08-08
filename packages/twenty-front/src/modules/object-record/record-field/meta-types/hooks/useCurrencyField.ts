import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';

export const useCurrencyField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.CURRENCY,
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

  const { setDraftValue } = useRecordFieldInput<FieldCurrencyValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  const defaultValue = fieldDefinition.defaultValue;

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    persistCurrencyField,
    defaultValue,
  };
};
