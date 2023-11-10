import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/display/icon/index';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';

export const opportunityBoardSortDefinitions: SortDefinition[] = [
  {
    fieldMetadataId: 'createdAt',
    label: 'Creation',
    Icon: IconCalendarEvent,
  },
  {
    fieldMetadataId: 'amount',
    label: 'Amount',
    Icon: IconCurrencyDollar,
  },
  {
    fieldMetadataId: 'closeDate',
    label: 'Expected close date',
    Icon: IconCalendarEvent,
  },
];
