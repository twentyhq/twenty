import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { FilterDefinitionByEntity } from '@/ui/data/filter/types/FilterDefinitionByEntity';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/display/icon/index';
import { Person } from '~/generated/graphql';

export const personTableFilterDefinitions: FilterDefinitionByEntity<Person>[] =
  [
    {
      fieldId: 'firstName',
      label: 'First name',
      Icon: IconUser,
      type: 'text',
    },
    {
      fieldId: 'lastName',
      label: 'Last name',
      Icon: IconUser,
      type: 'text',
    },
    {
      fieldId: 'email',
      label: 'Email',
      Icon: IconMail,
      type: 'text',
    },
    {
      fieldId: 'companyId',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      type: 'entity',
      // TODO: replace this with a component that selects the dropdown to use based on the entity type
      entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      fieldId: 'phone',
      label: 'Phone',
      Icon: IconPhone,
      type: 'text',
    },
    {
      fieldId: 'createdAt',
      label: 'Created at',
      Icon: IconCalendarEvent,
      type: 'date',
    },
    {
      fieldId: 'city',
      label: 'City',
      Icon: IconMap,
      type: 'text',
    },
  ];
