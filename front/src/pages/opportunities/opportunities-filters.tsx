import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconUser,
} from '@/ui/icon/index';
import { icon } from '@/ui/theme/constants/icon';
import { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
import { PipelineProgress } from '~/generated/graphql';

import { FilterDropdownPeopleSearchSelect } from '../../modules/people/components/FilterDropdownPeopleSearchSelect';

export const opportunitiesFilters: FilterDefinitionByEntity<PipelineProgress>[] =
  [
    {
      key: 'amount',
      label: 'Amount',
      icon: <IconCurrencyDollar size={icon.size.md} stroke={icon.stroke.sm} />,
      type: 'number',
    },
    {
      key: 'closeDate',
      label: 'Close date',
      icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
      type: 'date',
    },
    {
      key: 'companyId',
      label: 'Company',
      icon: (
        <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
      ),
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
      icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
      type: 'entity',
      entitySelectComponent: (
        <FilterDropdownPeopleSearchSelect
          context={CompanyBoardRecoilScopeContext}
        />
      ),
    },
  ];
