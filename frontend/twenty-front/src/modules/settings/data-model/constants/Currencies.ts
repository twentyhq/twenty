import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { type Currency } from '@/ui/input/components/internal/types/Currency';

export const CURRENCIES: Currency[] = Object.entries(
  SETTINGS_FIELD_CURRENCY_CODES,
).map(([key, { Icon, label }]) => ({
  value: key,
  Icon,
  label: `${label} (${key})`,
}));
