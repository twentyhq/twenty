import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { FilterDefinitionByEntity } from '@/ui/data/filter/types/FilterDefinitionByEntity';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconUser,
} from '@/ui/display/icon/index';
import { PipelineProgress } from '~/generated/graphql';

import { FilterDropdownPeopleSearchSelect } from '../../../modules/people/components/FilterDropdownPeopleSearchSelect';

export const opportunityBoardFilterDefinitions: FilterDefinitionByEntity<PipelineProgress>[] =
  [
    {
      fieldId: 'amount',
      label: 'Amount',
      Icon: IconCurrencyDollar,
      type: 'number',
    },
    {
      fieldId: 'closeDate',
      label: 'Close date',
      Icon: IconCalendarEvent,
      type: 'date',
    },
    {
      fieldId: 'companyId',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      type: 'entity',
      entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      fieldId: 'pointOfContactId',
      label: 'Point of contact',
      Icon: IconUser,
      type: 'entity',
      entitySelectComponent: <FilterDropdownPeopleSearchSelect />,
    },
  ];
