import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/display/icon/index';
import { FilterDefinitionByEntity } from '@/ui/object/filter/types/FilterDefinitionByEntity';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';
import { Company } from '~/generated/graphql';

export const companyTableFilterDefinitions: FilterDefinitionByEntity<Company>[] =
  [
    {
      fieldId: 'name',
      label: 'Name',
      Icon: IconBuildingSkyscraper,
      type: 'text',
    },
    {
      fieldId: 'employees',
      label: 'Employees',
      Icon: IconUsers,
      type: 'number',
    },
    {
      fieldId: 'domainName',
      label: 'URL',
      Icon: IconLink,
      type: 'text',
    },
    {
      fieldId: 'address',
      label: 'Address',
      Icon: IconMap,
      type: 'text',
    },
    {
      fieldId: 'createdAt',
      label: 'Created at',
      Icon: IconCalendarEvent,
      type: 'date',
    },
    {
      fieldId: 'accountOwnerId',
      label: 'Account owner',
      Icon: IconUser,
      type: 'entity',
      entitySelectComponent: <FilterDropdownUserSearchSelect />,
    },
  ];
