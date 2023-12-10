import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';

export const opportunityBoardSortDefinitions: SortDefinition[] = [
  {
    fieldMetadataId: 'createdAt',
    label: 'Creation',
    iconName: 'IconCalendarEvent',
  },
  {
    fieldMetadataId: 'amount',
    label: 'Amount',
    iconName: 'IconCurrencyDollar',
  },
  {
    fieldMetadataId: 'closeDate',
    label: 'Expected close date',
    iconName: 'IconCalendarEvent',
  },
];
