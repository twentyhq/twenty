import { useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { CurrencyCode } from '@/object-record/record-field/ui/types/CurrencyCode';
import { type SettingsDataModelFieldCurrencyFormValues } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { isNonEmptyString } from '@sniptt/guards';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

type UseCurrencySettingsFormInitialValuesArgs = {
  existingFieldMetadataId: string;
};
export const useCurrencySettingsFormInitialValues = ({
  existingFieldMetadataId,
}: UseCurrencySettingsFormInitialValuesArgs) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const initialAmountMicrosValue =
    (fieldMetadataItem?.defaultValue?.amountMicros as number | null) ?? null;
  const initialCurrencyCodeValue = isNonEmptyString(
    stripSimpleQuotesFromString(fieldMetadataItem?.defaultValue?.currencyCode),
  )
    ? fieldMetadataItem?.defaultValue?.currencyCode
    : applySimpleQuotesToString(CurrencyCode.USD);

  const initialFormValues: SettingsDataModelFieldCurrencyFormValues = {
    settings: {
      format: fieldMetadataItem?.settings?.format ?? 'short',
    },
    defaultValue: {
      amountMicros: initialAmountMicrosValue,
      currencyCode: initialCurrencyCodeValue,
    },
  };

  const { resetField } =
    useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  const resetDefaultValueField = () => {
    resetField('defaultValue', {
      defaultValue: initialFormValues.defaultValue,
    });
    resetField('settings', { defaultValue: initialFormValues.settings });
  };

  return {
    initialAmountMicrosValue,
    initialCurrencyCodeValue,
    initialSettingsValue: initialFormValues.settings,
    initialDefaultValue: initialFormValues.defaultValue,
    resetDefaultValueField,
  };
};
