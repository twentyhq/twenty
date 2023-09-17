import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/icon/index';
import { SortDefinition } from '@/ui/view-bar/types/SortDefinition';

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
