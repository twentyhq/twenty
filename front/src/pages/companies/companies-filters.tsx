import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/icon/index';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { icon } from '@/ui/theme/constants/icon';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';
import { Company } from '~/generated/graphql';

export const companiesFilters: FilterDefinitionByEntity<Company>[] = [
  {
    key: 'name',
    label: 'Name',
    icon: (
      <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
    ),
    type: 'text',
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: <IconUsers size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'number',
  },
  {
    key: 'domainName',
    label: 'URL',
    icon: <IconLink size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    key: 'address',
    label: 'Address',
    icon: <IconMap size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    key: 'createdAt',
    label: 'Created at',
    icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'date',
  },
  {
    key: 'accountOwnerId',
    label: 'Account owner',
    icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'entity',
    entitySelectComponent: (
      <FilterDropdownUserSearchSelect context={TableRecoilScopeContext} />
    ),
  },
];
