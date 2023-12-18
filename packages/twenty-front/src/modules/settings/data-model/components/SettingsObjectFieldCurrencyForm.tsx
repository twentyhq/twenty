import { CurrencyCode } from '@/object-record/field/types/CurrencyCode';
import { Select } from '@/ui/input/components/Select';
import { CardContent } from '@/ui/layout/card/components/CardContent';

import { settingsFieldCurrencyCodes } from '../constants/settingsFieldCurrencyCodes';

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
      label="Unit"
      dropdownScopeId="currency-unit-select"
      value={values.currencyCode}
      options={Object.entries(settingsFieldCurrencyCodes).map(
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
