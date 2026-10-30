import { type RelativeDateFilterUnit } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const RELATIVE_DATE_UNITS: RelativeDateFilterUnit[] = [
  doNotTranslate('DAY'),
  'WEEK',
  'MONTH',
  'QUARTER',
  'YEAR',
];
