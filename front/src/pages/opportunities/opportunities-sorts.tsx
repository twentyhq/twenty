import { SortDefinition } from '@/ui/Data/View Bar/types/SortDefinition';
import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/Display/Icon/index';

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
