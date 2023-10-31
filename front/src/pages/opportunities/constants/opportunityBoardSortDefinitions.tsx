import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/display/icon/index';
import { SortDefinition } from '@/ui/object/sort/types/SortDefinition';

export const opportunityBoardSortDefinitions: SortDefinition[] = [
  {
    fieldId: 'createdAt',
    label: 'Creation',
    Icon: IconCalendarEvent,
  },
  {
    fieldId: 'amount',
    label: 'Amount',
    Icon: IconCurrencyDollar,
  },
  {
    fieldId: 'closeDate',
    label: 'Expected close date',
    Icon: IconCalendarEvent,
  },
];
