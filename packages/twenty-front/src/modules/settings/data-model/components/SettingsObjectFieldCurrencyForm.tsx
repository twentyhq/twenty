import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { Select } from '@/ui/input/components/Select';
import { CardContent } from '@/ui/layout/card/components/CardContent';

import { SETTINGS_FIELD_CURRENCY_CODES } from '../constants/SettingsFieldCurrencyCodes';

export type SettingsObjectFieldCurrencyFormValues = {
  currencyCode: CurrencyCode;
};

type SettingsObjectFieldCurrencyFormProps = {
  disabled?: boolean;
  onChange: (values: Partial<SettingsObjectFieldCurrencyFormValues>) => void;
  values: SettingsObjectFieldCurrencyFormValues;
};

export const SettingsObjectFieldCurrencyForm = ({
  disabled,
  onChange,
  values,
}: SettingsObjectFieldCurrencyFormProps) => (
  <CardContent>
    <Select
      fullWidth
      disabled={disabled}
      label="Default Unit"
      dropdownId="currency-unit-select"
      value={values.currencyCode}
      options={Object.entries(SETTINGS_FIELD_CURRENCY_CODES).map(
        ([value, { label, Icon }]) => ({
          label,
          value: value as CurrencyCode,
          Icon,
        }),
      )}
      onChange={(value) => onChange({ currencyCode: value })}
    />
  </CardContent>
);
