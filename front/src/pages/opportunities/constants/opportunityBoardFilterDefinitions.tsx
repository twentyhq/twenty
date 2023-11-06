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
      fieldId: 'amount',
      label: 'Amount',
      Icon: IconCurrencyDollar,
      type: 'NUMBER',
    },
    {
      fieldId: 'closeDate',
      label: 'Close date',
      Icon: IconCalendarEvent,
      type: 'DATE',
    },
    {
      fieldId: 'companyId',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      type: 'ENTITY',
      entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      fieldId: 'pointOfContactId',
      label: 'Point of contact',
      Icon: IconUser,
      type: 'ENTITY',
      entitySelectComponent: <FilterDropdownPeopleSearchSelect />,
    },
  ];
