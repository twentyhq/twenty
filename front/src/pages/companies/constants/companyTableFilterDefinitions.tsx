import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/display/icon/index';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';
import { Company } from '~/generated/graphql';

export const companyTableFilterDefinitions: FilterDefinitionByEntity<Company>[] =
  [
    {
      fieldId: 'name',
      label: 'Name',
      Icon: IconBuildingSkyscraper,
      type: 'TEXT',
    },
    {
      fieldId: 'employees',
      label: 'Employees',
      Icon: IconUsers,
      type: 'NUMBER',
    },
    {
      fieldId: 'domainName',
      label: 'URL',
      Icon: IconLink,
      type: 'TEXT',
    },
    {
      fieldId: 'address',
      label: 'Address',
      Icon: IconMap,
      type: 'TEXT',
    },
    {
      fieldId: 'createdAt',
      label: 'Created at',
      Icon: IconCalendarEvent,
      type: 'DATE',
    },
    {
      fieldId: 'accountOwnerId',
      label: 'Account owner',
      Icon: IconUser,
      type: 'ENTITY',
      entitySelectComponent: <FilterDropdownUserSearchSelect />,
    },
  ];
