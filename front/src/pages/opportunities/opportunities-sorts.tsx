import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';
import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/display/icon/index';

export const opportunitiesSorts: SortDefinition[] = [
  {
    key: 'createdAt',
    label: 'Creation',
    Icon: IconCalendarEvent,
  },
  {
    key: 'amount',
    label: 'Amount',
    Icon: IconCurrencyDollar,
  },
  {
    key: 'closeDate',
    label: 'Expected close date',
    Icon: IconCalendarEvent,
  },
];
