import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyFormat } from '@/object-record/record-field/types/FieldMetadata';
import { SettingsDataModelFieldCurrencyFormValues } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

export const useCurrencySettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue'>;
}) => {
  console.log(fieldMetadataItem)
  const initialAmountMicrosValue =
    (fieldMetadataItem?.defaultValue?.amountMicros as number | null) ?? null;
  const initialCurrencyCodeValue =
    fieldMetadataItem?.defaultValue?.currencyCode ??
    applySimpleQuotesToString(CurrencyCode.USD);
  const initialFormatValue =
    (fieldMetadataItem?.defaultValue?.format as FieldCurrencyFormat) ?? applySimpleQuotesToString('short');
  const initialDefaultValue = {
    amountMicros: initialAmountMicrosValue,
    currencyCode: initialCurrencyCodeValue,
    format: initialFormatValue,
  };

  const { resetField } =
    useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  const resetDefaultValueField = () =>
    // TODO
    resetField('defaultValue', { defaultValue: initialDefaultValue });

  return {
    initialAmountMicrosValue,
    initialCurrencyCodeValue,
    initialFormatValue,
    initialDefaultValue,
    resetDefaultValueField,
  };
};
