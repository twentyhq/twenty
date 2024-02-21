import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import useI18n from '@/ui/i18n/useI18n';
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
}: SettingsObjectFieldCurrencyFormProps) => {
  const { translate } = useI18n('translations');

  return (
    <CardContent>
      <Select
        fullWidth
        disabled={disabled}
        label={translate('unit')}
        dropdownId="currency-unit-select"
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
};
