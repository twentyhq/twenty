import { CurrencyCode } from '@/object-record/field/types/CurrencyCode';
import {
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconCurrencyFrank,
  IconCurrencyPound,
  IconCurrencyYen,
  IconCurrencyYuan,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export const settingsFieldCurrencyCodes: Record<
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
