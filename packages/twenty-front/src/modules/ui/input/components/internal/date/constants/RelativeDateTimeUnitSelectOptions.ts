import { RELATIVE_DATE_UNITS } from '@/ui/input/components/internal/date/constants/RelativeDateUnitSelectOptions';
import { type RelativeDateFilterUnit } from 'twenty-shared/utils';

export const RELATIVE_DATETIME_UNITS: RelativeDateFilterUnit[] = [
  'SECOND',
  'MINUTE',
  'HOUR',
  ...RELATIVE_DATE_UNITS,
];
