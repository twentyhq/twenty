import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUsers,
} from '@/ui/display/icon/index';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';

export const companyTableSortDefinitions: SortDefinition[] = [
  {
    fieldMetadataId: 'name',
    label: 'Name',
    Icon: IconBuildingSkyscraper,
  },
  {
    fieldMetadataId: 'employees',
    label: 'Employees',
    Icon: IconUsers,
  },
  {
    fieldMetadataId: 'domainName',
    label: 'Url',
    Icon: IconLink,
  },
  {
    fieldMetadataId: 'address',
    label: 'Address',
    Icon: IconMap,
  },
  {
    fieldMetadataId: 'createdAt',
    label: 'Creation',
    Icon: IconCalendarEvent,
  },
];
