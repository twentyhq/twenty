import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/display/icon/index';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';
import { Person } from '~/generated/graphql';

export const personTableFilterDefinitions: FilterDefinitionByEntity<Person>[] =
  [
    {
      fieldId: 'firstName',
      label: 'First name',
      Icon: IconUser,
      type: 'TEXT',
    },
    {
      fieldId: 'lastName',
      label: 'Last name',
      Icon: IconUser,
      type: 'TEXT',
    },
    {
      fieldId: 'email',
      label: 'Email',
      Icon: IconMail,
      type: 'TEXT',
    },
    {
      fieldId: 'companyId',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      type: 'ENTITY',
      // TODO: replace this with a component that selects the dropdown to use based on the entity type
      entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      fieldId: 'phone',
      label: 'Phone',
      Icon: IconPhone,
      type: 'TEXT',
    },
    {
      fieldId: 'createdAt',
      label: 'Created at',
      Icon: IconCalendarEvent,
      type: 'DATE',
    },
    {
      fieldId: 'city',
      label: 'City',
      Icon: IconMap,
      type: 'TEXT',
    },
  ];
