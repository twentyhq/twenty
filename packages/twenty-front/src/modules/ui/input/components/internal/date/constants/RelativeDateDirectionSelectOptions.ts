import { VariableDateViewFilterValueDirection } from '@/views/view-filter-value/utils/resolveDateViewFilterValue';

type RelativeDateDirectionOption = {
  value: VariableDateViewFilterValueDirection;
  label: string;
};

export const RELATIVE_DATE_DIRECTION_SELECT_OPTIONS: RelativeDateDirectionOption[] =
  [
    { value: 'PAST', label: 'Past' },
    { value: 'THIS', label: 'This' },
    { value: 'NEXT', label: 'Next' },
  ];
