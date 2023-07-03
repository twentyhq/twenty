import { EntityFilterWithField } from '@/filters-and-sorts/types/EntityFilterWithField';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/icons/index';
import { icon } from '@/ui/themes/icon';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';
import { Company } from '~/generated/graphql';

export const companiesFilters: EntityFilterWithField<Company>[] = [
  {
    field: 'name',
    label: 'Name',
    icon: (
      <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
    ),
    type: 'text',
  },
  {
    field: 'employees',
    label: 'Employees',
    icon: <IconUsers size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'number',
  },
  {
    field: 'domainName',
    label: 'URL',
    icon: <IconLink size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    field: 'address',
    label: 'Address',
    icon: <IconMap size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    field: 'createdAt',
    label: 'Created at',
    icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'date',
  },
  {
    field: 'accountOwnerId',
    label: 'Account owner',
    icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'entity',
    searchSelectComponent: <FilterDropdownUserSearchSelect />,
  },
];
