import { VariableDateViewFilterValueDirection } from '@/views/utils/view-filter-value/resolveDateViewFilterValue';

export const RELATIVE_DATE_DIRECTIONS: {
  value: VariableDateViewFilterValueDirection;
  label: string;
}[] = [
  { value: 'PAST', label: 'Past' },
  { value: 'THIS', label: 'This' },
  { value: 'NEXT', label: 'Next' },
];
