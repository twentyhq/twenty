import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { SettingsDataModelFieldDateFormValues } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

export const useDateSettingsFormInitialValues = ({
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

  const { resetField } = useFormContext<SettingsDataModelFieldDateFormValues>();

  const resetDefaultValueField = () =>
    resetField('defaultValue', { defaultValue: initialDefaultValue });

  return {
    initialAmountMicrosValue,
    initialCurrencyCodeValue,
    initialDefaultValue,
    resetDefaultValueField,
  };
};
