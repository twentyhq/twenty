import {
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconCurrencyFrank,
  IconCurrencyPound,
  IconCurrencyYen,
  IconCurrencyYuan,
} from 'twenty-ui';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export const SETTINGS_FIELD_CURRENCY_CODES: Record<
  CurrencyCode,
  { label: string; Icon: IconComponent }
> = {
  USD: {
    label: 'United States dollar',
    Icon: IconCurrencyDollar,
  },
  EUR: {
    label: 'Euro',
    Icon: IconCurrencyEuro,
  },
  JPY: {
    label: 'Japanese yen',
    Icon: IconCurrencyYen,
  },
  GBP: {
    label: 'British pound',
    Icon: IconCurrencyPound,
  },
  CAD: {
    label: 'Canadian dollar',
    Icon: IconCurrencyDollar,
  },
  CHF: {
    label: 'Swiss franc',
    Icon: IconCurrencyFrank,
  },
  CNY: {
    label: 'Chinese yuan',
    Icon: IconCurrencyYuan,
  },
  HKD: {
    label: 'Hong Kong dollar',
    Icon: IconCurrencyDollar,
  },
};
