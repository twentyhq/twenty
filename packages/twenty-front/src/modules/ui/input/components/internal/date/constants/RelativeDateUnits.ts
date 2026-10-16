import { type RelativeDateFilterUnit } from 'twenty-shared/utils';

export const RELATIVE_DATE_UNITS: RelativeDateFilterUnit[] = [
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a relative-date enum value stored in filters.
  'DAY',
  'WEEK',
  'MONTH',
  'QUARTER',
  'YEAR',
];
