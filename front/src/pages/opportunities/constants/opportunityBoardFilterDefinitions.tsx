import { Opportunity } from '@/pipeline/types/Opportunity';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';

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
      type: 'DATE',
    },
    {
      fieldMetadataId: 'companyId',
      label: 'Company',
      iconName: 'IconBuildingSkyscraper',
      type: 'ENTITY',
      // entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      fieldMetadataId: 'pointOfContactId',
      label: 'Point of contact',
      iconName: 'IconUser',
      type: 'ENTITY',
      //entitySelectComponent: <FilterDropdownPeopleSearchSelect />,
    },
  ];
