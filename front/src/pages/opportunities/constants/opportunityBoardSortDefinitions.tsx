import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';
import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/display/icon/index';

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
