import { NEVER_EXPIRE_DELTA_IN_YEARS } from '@/settings/developers/constants/NeverExpireDeltaInYears';

export const EXPIRATION_DATES: {
  value: number | null;
  label: string;
}[] = [
  { label: '15 dias', value: 15 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: '1 ano', value: 365 },
  { label: '2 anos', value: 2 * 365 },
  { label: 'Nunca', value: NEVER_EXPIRE_DELTA_IN_YEARS * 365 },
];
