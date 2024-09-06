import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { SettingsDataModelFieldCurrencyFormValues } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

export const useCurrencySettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue'>;
}) => {
  const initialAmountMicrosValue =
    (fieldMetadataItem?.defaultValue?.amountMicros as number | null) ?? null;
  const initialCurrencyCodeValue =
    fieldMetadataItem?.defaultValue?.currencyCode ??
    applySimpleQuotesToString(CurrencyCode.USD);
  const initialDefaultValue = {
    amountMicros: initialAmountMicrosValue,
    currencyCode: initialCurrencyCodeValue,
  };

  const { resetField } =
    useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  const resetDefaultValueField = () =>
    resetField('defaultValue', { defaultValue: initialDefaultValue });

  return {
    initialAmountMicrosValue,
    initialCurrencyCodeValue,
    initialDefaultValue,
    resetDefaultValueField,
  };
};
