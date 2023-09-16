import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconUser,
} from '@/ui/icon/index';
import { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
import { PipelineProgress } from '~/generated/graphql';

import { FilterDropdownPeopleSearchSelect } from '../../modules/people/components/FilterDropdownPeopleSearchSelect';

export const opportunitiesFilters: FilterDefinitionByEntity<PipelineProgress>[] =
  [
    {
      key: 'amount',
      label: 'Amount',
      Icon: IconCurrencyDollar,
      type: 'number',
    },
    {
      key: 'closeDate',
      label: 'Close date',
      Icon: IconCalendarEvent,
      type: 'date',
    },
    {
      key: 'companyId',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      type: 'entity',
      entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      key: 'pointOfContactId',
      label: 'Point of contact',
      Icon: IconUser,
      type: 'entity',
      entitySelectComponent: <FilterDropdownPeopleSearchSelect />,
    },
  ];
