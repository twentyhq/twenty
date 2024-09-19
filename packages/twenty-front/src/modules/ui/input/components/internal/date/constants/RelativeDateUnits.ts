import { VariableDateViewFilterValueUnit } from '@/views/utils/view-filter-value/resolveDateViewFilterValue';

export const RELATIVE_DATE_UNITS: {
  value: VariableDateViewFilterValueUnit;
  label: string;
}[] = [
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'YEAR', label: 'Year' },
];
