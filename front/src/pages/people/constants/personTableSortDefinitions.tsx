import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/display/icon/index';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { SortDirection } from '@/ui/object/object-sort-dropdown/types/SortDirection';

export const personTableSortDefinitions: SortDefinition[] = [
  {
    fieldMetadataId: 'fullname',
    label: 'People',
    Icon: IconUser,

    getOrderByTemplate: (direction: SortDirection) => [
      { firstName: direction },
      { lastName: direction },
    ],
  },
  {
    fieldMetadataId: 'company_name',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    getOrderByTemplate: (direction: SortDirection) => [
      { company: { name: direction } },
    ],
  },
  {
    fieldMetadataId: 'email',
    label: 'Email',
    Icon: IconMail,
  },
  {
    fieldMetadataId: 'phone',
    label: 'Phone',
    Icon: IconPhone,
  },
  {
    fieldMetadataId: 'createdAt',
    label: 'Created at',
    Icon: IconCalendarEvent,
  },
  {
    fieldMetadataId: 'city',
    label: 'City',
    Icon: IconMap,
  },
];
