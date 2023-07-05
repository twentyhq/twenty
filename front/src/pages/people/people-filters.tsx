import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { TableFilterDefinitionByEntity } from '@/filters-and-sorts/types/TableFilterDefinitionByEntity';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icons/index';
import { icon } from '@/ui/themes/icon';
import { Person } from '~/generated/graphql';

export const peopleFilters: TableFilterDefinitionByEntity<Person>[] = [
  {
    field: 'firstName',
    label: 'First name',
    icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    field: 'lastName',
    label: 'Last name',
    icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    field: 'email',
    label: 'Email',
    icon: <IconMail size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    field: 'companyId',
    label: 'Company',
    icon: (
      <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
    ),
    type: 'entity',
    entitySelectComponent: <FilterDropdownCompanySearchSelect />,
  },
  {
    field: 'phone',
    label: 'Phone',
    icon: <IconPhone size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    field: 'createdAt',
    label: 'Created at',
    icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'date',
  },
  {
    field: 'city',
    label: 'City',
    icon: <IconMap size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
];
