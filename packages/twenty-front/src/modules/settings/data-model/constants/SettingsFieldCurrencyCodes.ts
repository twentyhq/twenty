import {
  IconComponent,
  IconCurrencyBaht,
  IconCurrencyDirham,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconCurrencyFrank,
  IconCurrencyKroneCzech,
  IconCurrencyKroneSwedish,
  IconCurrencyPound,
  IconCurrencyReal,
  IconCurrencyRiyal,
  IconCurrencyWon,
  IconCurrencyYen,
  IconCurrencyYuan,
} from 'twenty-ui';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';

export const SETTINGS_FIELD_CURRENCY_CODES: Record<
  CurrencyCode,
  { label: string; Icon: IconComponent }
> = {
  BRL: {
    label: 'Real brasileiro',
    Icon: IconCurrencyReal,
  },
  USD: {
    label: 'Dólar americano',
    Icon: IconCurrencyDollar,
  },
  EUR: {
    label: 'Euro',
    Icon: IconCurrencyEuro,
  },
  JPY: {
    label: 'Iene japonês',
    Icon: IconCurrencyYen,
  },
  GBP: {
    label: 'Libra esterlina',
    Icon: IconCurrencyPound,
  },
  CAD: {
    label: 'Dólar canadense',
    Icon: IconCurrencyDollar,
  },
  CHF: {
    label: 'Franco suíço',
    Icon: IconCurrencyFrank,
  },
  CNY: {
    label: 'Yuan chinês',
    Icon: IconCurrencyYuan,
  },
  CZK: {
    label: 'Coroa tcheca',
    Icon: IconCurrencyKroneCzech,
  },
  HKD: {
    label: 'Dólar de Hong Kong',
    Icon: IconCurrencyDollar,
  },
  NOK: {
    label: 'Coroa norueguesa',
    Icon: IconCurrencyKroneSwedish,
  },
  SEK: {
    label: 'Coroa sueca',
    Icon: IconCurrencyKroneSwedish,
  },
  BHT: {
    label: 'Baht tailandês',
    Icon: IconCurrencyBaht,
  },
  MAD: {
    label: 'Dirham marroquino',
    Icon: IconCurrencyDirham,
  },
  QAR: {
    label: 'Rial catariano',
    Icon: IconCurrencyRiyal,
  },
  AED: {
    label: 'Dirham dos Emirados Árabes Unidos',
    Icon: IconCurrencyDirham,
  },
  KRW: {
    label: 'Won sul-coreano',
    Icon: IconCurrencyWon,
  },
  AUD: {
    label: 'Dólar australiano',
    Icon: IconCurrencyDollar,
  },
};
