import { NEVER_EXPIRE_DELTA_IN_YEARS } from '@/settings/developers/constants/NeverExpireDeltaInYears';
import i18n from '~/utils/i18n';

export const EXPIRATION_DATES: {
  value: number | null;
  label: string;
}[] = [
  { label: `15 ${i18n.t('days')}`, value: 15 },
  { label: `30 ${i18n.t('days')}`, value: 30 },
  { label: `90 ${i18n.t('days')}`, value: 90 },
  { label: `1 ${i18n.t('year')}`, value: 365 },
  { label: `2 ${i18n.t('years')}`, value: 2 * 365 },
  { label: `${i18n.t('never')}`, value: NEVER_EXPIRE_DELTA_IN_YEARS * 365 },
];
