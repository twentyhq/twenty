import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { type CurrencyPickerOption } from 'twenty-ui/components';

export const CURRENCY_PICKER_CURRENCIES: readonly CurrencyPickerOption[] =
  Object.entries(SETTINGS_FIELD_CURRENCY_CODES).map(([code, { label }]) => ({
    code,
    name: label,
  }));
