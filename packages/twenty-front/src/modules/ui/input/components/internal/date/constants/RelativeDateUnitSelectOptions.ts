import { VariableDateViewFilterValueUnit } from '@/views/utils/view-filter-value/resolveDateViewFilterValue';

type RelativeDateUnit = {
  value: VariableDateViewFilterValueUnit;
  label: string;
};

export const RELATIVE_DATE_UNITS_SELECT_OPTIONS: RelativeDateUnit[] = [
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'YEAR', label: 'Year' },
];
