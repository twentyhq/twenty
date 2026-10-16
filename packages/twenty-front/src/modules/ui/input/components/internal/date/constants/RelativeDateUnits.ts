import {
  doNotTranslate,
  type RelativeDateFilterUnit,
} from 'twenty-shared/utils';

export const RELATIVE_DATE_UNITS: RelativeDateFilterUnit[] = [
  doNotTranslate('DAY'),
  'WEEK',
  'MONTH',
  'QUARTER',
  'YEAR',
];
