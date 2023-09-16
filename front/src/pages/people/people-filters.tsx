import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icon/index';
import { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
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
    // TODO: replace this with a component that selects the dropdown to use based on the entity type
    entitySelectComponent: <FilterDropdownCompanySearchSelect />,
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
