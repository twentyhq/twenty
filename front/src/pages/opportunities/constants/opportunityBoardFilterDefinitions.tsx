import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconUser,
} from '@/ui/display/icon/index';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';
import { PipelineProgress } from '~/generated/graphql';

import { FilterDropdownPeopleSearchSelect } from '../../../modules/people/components/FilterDropdownPeopleSearchSelect';

export const opportunityBoardFilterDefinitions: FilterDefinitionByEntity<PipelineProgress>[] =
  [
    {
      fieldMetadataId: 'amount',
      label: 'Amount',
      Icon: IconCurrencyDollar,
      type: 'NUMBER',
    },
    {
      fieldMetadataId: 'closeDate',
      label: 'Close date',
      Icon: IconCalendarEvent,
      type: 'DATE',
    },
    {
      fieldMetadataId: 'companyId',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      type: 'ENTITY',
      entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      fieldMetadataId: 'pointOfContactId',
      label: 'Point of contact',
      Icon: IconUser,
      type: 'ENTITY',
      entitySelectComponent: <FilterDropdownPeopleSearchSelect />,
    },
  ];
