import { useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type SettingsDataModelFieldCurrencyFormValues } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { CurrencyCode } from 'twenty-shared/constants';
import { getFieldMetadataItemInitialValues } from '~/pages/settings/data-model/utils/getFieldMetadataItemInitialValues';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

type UseCurrencySettingsFormInitialValuesArgs = {
  existingFieldMetadataId: string;
};
export const useCurrencySettingsFormInitialValues = ({
  existingFieldMetadataId,
}: UseCurrencySettingsFormInitialValuesArgs) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const { settings, defaultValue } =
    getFieldMetadataItemInitialValues(fieldMetadataItem);

  const initialFormValues: SettingsDataModelFieldCurrencyFormValues = {
    settings: settings ?? {
      format: 'short',
      decimals: DEFAULT_DECIMAL_VALUE,
    },
    defaultValue: defaultValue ?? {
      amountMicros: null,
      currencyCode: applySimpleQuotesToString(CurrencyCode.USD),
    },
  };

  const initialAmountMicrosValue = initialFormValues.defaultValue.amountMicros;
  const initialCurrencyCodeValue = initialFormValues.defaultValue.currencyCode;

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
