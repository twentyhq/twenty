import { FilterDropdownMultipleCompanySearchSelect } from '@/companies/components/FilterDropdownMultipleCompanySearchSelect';
import { FilterDropdownMultiplePeopleSearchSelect } from '@/people/components/FilterDropdownMultiplePeopleSearchSelect';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconUser,
} from '@/ui/icon/index';
import { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
import { PipelineProgress } from '~/generated/graphql';

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
      type: 'entities',
      entitySelectComponent: <FilterDropdownMultipleCompanySearchSelect />,
    },
    {
      key: 'pointOfContactId',
      label: 'Point of contact',
      Icon: IconUser,
      type: 'entities',
      entitySelectComponent: <FilterDropdownMultiplePeopleSearchSelect />,
    },
  ];
