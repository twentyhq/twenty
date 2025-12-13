import { type RelativeDateFilterUnit } from 'twenty-shared/utils';

type RelativeDateUnitOption = {
  value: RelativeDateFilterUnit;
  label: string;
};

export const RELATIVE_DATE_UNITS_SELECT_OPTIONS: RelativeDateUnitOption[] = [
  { value: 'SECOND', label: 'Second' },
  { value: 'MINUTE', label: 'Minute' },
  { value: 'HOUR', label: 'Hour' },
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'YEAR', label: 'Year' },
];
