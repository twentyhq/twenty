import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { SettingsDataModelFieldCurrencyFormValues } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

type UseCurrencySettingsFormInitialValuesArgs = {
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};
export const useCurrencySettingsFormInitialValues = ({
  fieldMetadataItem,
}: UseCurrencySettingsFormInitialValuesArgs) => {
  const initialAmountMicrosValue =
    (fieldMetadataItem?.defaultValue?.amountMicros as number | null) ?? null;
  const initialCurrencyCodeValue =
    fieldMetadataItem?.defaultValue?.currencyCode ??
    applySimpleQuotesToString(CurrencyCode.USD);
  const initialFormatValue = fieldMetadataItem?.settings?.format ?? "'short'";
  const initialDefaultValue: SettingsDataModelFieldCurrencyFormValues['defaultValue'] =
    {
      amountMicros: initialAmountMicrosValue,
      currencyCode: initialCurrencyCodeValue,
    };

  const { resetField } =
    useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  const resetDefaultValueField = () => {
    resetField('defaultValue', { defaultValue: initialDefaultValue });
    resetField('settings', { defaultValue: { format: initialFormatValue } });
  };

  return {
    initialAmountMicrosValue,
    initialCurrencyCodeValue,
    initialFormatValue,
    initialDefaultValue,
    resetDefaultValueField,
  };
};
