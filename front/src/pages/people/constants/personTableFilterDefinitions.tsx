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
      fieldMetadataId: 'firstName',
      label: 'First name',
      Icon: IconUser,
      type: 'TEXT',
    },
    {
      fieldMetadataId: 'lastName',
      label: 'Last name',
      Icon: IconUser,
      type: 'TEXT',
    },
    {
      fieldMetadataId: 'email',
      label: 'Email',
      Icon: IconMail,
      type: 'TEXT',
    },
    {
      fieldMetadataId: 'companyId',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      type: 'ENTITY',
      // TODO: replace this with a component that selects the dropdown to use based on the entity type
      entitySelectComponent: <FilterDropdownCompanySearchSelect />,
    },
    {
      fieldMetadataId: 'phone',
      label: 'Phone',
      Icon: IconPhone,
      type: 'TEXT',
    },
    {
      fieldMetadataId: 'createdAt',
      label: 'Created at',
      Icon: IconCalendarEvent,
      type: 'DATE',
    },
    {
      fieldMetadataId: 'city',
      label: 'City',
      Icon: IconMap,
      type: 'TEXT',
    },
  ];
