import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { FilterConfigType } from '@/filters-and-sorts/interfaces/filters/interface';
import { EntityFilterWithField } from '@/filters-and-sorts/types/EntityFilterWithField';
import { SEARCH_COMPANY_QUERY } from '@/search/services/search';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icons/index';
import { icon } from '@/ui/themes/icon';
import { Company, Person, QueryMode } from '~/generated/graphql';

export const peopleFilters: EntityFilterWithField<Person>[] = [
  {
    field: 'firstname',
    label: 'First name',
    icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'text',
  },
  {
    field: 'lastname',
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
    searchSelectComponent: <FilterDropdownCompanySearchSelect />,
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
