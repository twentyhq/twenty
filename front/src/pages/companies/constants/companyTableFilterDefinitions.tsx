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
      fieldMetadataId: 'name',
      label: 'Name',
      Icon: IconBuildingSkyscraper,
      type: 'TEXT',
    },
    {
      fieldMetadataId: 'employees',
      label: 'Employees',
      Icon: IconUsers,
      type: 'NUMBER',
    },
    {
      fieldMetadataId: 'domainName',
      label: 'URL',
      Icon: IconLink,
      type: 'TEXT',
    },
    {
      fieldMetadataId: 'address',
      label: 'Address',
      Icon: IconMap,
      type: 'TEXT',
    },
    {
      fieldMetadataId: 'createdAt',
      label: 'Created at',
      Icon: IconCalendarEvent,
      type: 'DATE',
    },
    {
      fieldMetadataId: 'accountOwnerId',
      label: 'Account owner',
      Icon: IconUser,
      type: 'ENTITY',
      entitySelectComponent: <FilterDropdownUserSearchSelect />,
    },
  ];
