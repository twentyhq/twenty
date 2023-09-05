import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icon/index';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { Person } from '~/generated/graphql';

export const peopleFilters: FilterDefinitionByEntity<Person>[] = [
  {
    key: 'firstName',
    label: 'First name',
    Icon: IconUser,
    type: 'text',
  },
  {
    key: 'lastName',
    label: 'Last name',
    Icon: IconUser,
    type: 'text',
  },
  {
    key: 'email',
    label: 'Email',
    Icon: IconMail,
    type: 'text',
  },
  {
    key: 'companyId',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    type: 'entity',
    entitySelectComponent: (
      <FilterDropdownCompanySearchSelect context={TableRecoilScopeContext} />
    ),
  },
  {
    key: 'phone',
    label: 'Phone',
    Icon: IconPhone,
    type: 'text',
  },
  {
    key: 'createdAt',
    label: 'Created at',
    Icon: IconCalendarEvent,
    type: 'date',
  },
  {
    key: 'city',
    label: 'City',
    Icon: IconMap,
    type: 'text',
  },
];
