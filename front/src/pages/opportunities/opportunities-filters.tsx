import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconUser,
} from '@/ui/icon/index';
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
      entitySelectComponent: (
        <FilterDropdownCompanySearchSelect
          context={CompanyBoardRecoilScopeContext}
        />
      ),
    },
    {
      key: 'pointOfContactId',
      label: 'Point of contact',
      Icon: IconUser,
      type: 'entity',
      entitySelectComponent: (
        <FilterDropdownPeopleSearchSelect
          context={CompanyBoardRecoilScopeContext}
        />
      ),
    },
  ];
