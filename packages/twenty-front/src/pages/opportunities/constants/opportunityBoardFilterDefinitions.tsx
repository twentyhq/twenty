import { FilterDefinitionByEntity } from '@/object-record/object-filter-dropdown/types/FilterDefinitionByEntity';
import { Opportunity } from '@/pipeline/types/Opportunity';

export const opportunityBoardFilterDefinitions: FilterDefinitionByEntity<Opportunity>[] =
  [
    {
      fieldMetadataId: 'amount',
      label: 'Amount',
      iconName: 'IconCurrencyDollar',
      type: 'NUMBER',
    },
    {
      fieldMetadataId: 'closeDate',
      label: 'Close date',
      iconName: 'IconCalendarEvent',
      type: 'DATE_TIME',
    },
    {
      fieldMetadataId: 'companyId',
      label: 'Company',
      iconName: 'IconBuildingSkyscraper',
      type: 'RELATION',
    },
    {
      fieldMetadataId: 'pointOfContactId',
      label: 'Point of contact',
      iconName: 'IconUser',
      type: 'RELATION',
    },
  ];
