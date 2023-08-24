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
import { icon } from '@/ui/theme/constants/icon';
import { Person } from '~/generated/graphql';

export const peopleFilters: FilterDefinitionByEntity<Person>[] = [
  {
    key: 'firstName',
    label: 'First name',
    icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    key: 'lastName',
    label: 'Last name',
    icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    key: 'email',
    label: 'Email',
    icon: <IconMail size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    key: 'companyId',
    label: 'Company',
    icon: (
      <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
    ),
    type: 'entity',
    entitySelectComponent: (
      <FilterDropdownCompanySearchSelect context={TableRecoilScopeContext} />
    ),
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: <IconPhone size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    key: 'createdAt',
    label: 'Created at',
    icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'date',
  },
  {
    key: 'city',
    label: 'City',
    icon: <IconMap size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
];
