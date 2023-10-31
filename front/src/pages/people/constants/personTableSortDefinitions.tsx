import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/display/icon/index';
import { SortDefinition } from '@/ui/object/sort/types/SortDefinition';
import { SortDirection } from '@/ui/object/sort/types/SortDirection';

export const personTableSortDefinitions: SortDefinition[] = [
  {
    fieldId: 'fullname',
    label: 'People',
    Icon: IconUser,

    getOrderByTemplate: (direction: SortDirection) => [
      { firstName: direction },
      { lastName: direction },
    ],
  },
  {
    fieldId: 'company_name',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    getOrderByTemplate: (direction: SortDirection) => [
      { company: { name: direction } },
    ],
  },
  {
    fieldId: 'email',
    label: 'Email',
    Icon: IconMail,
  },
  {
    fieldId: 'phone',
    label: 'Phone',
    Icon: IconPhone,
  },
  {
    fieldId: 'createdAt',
    label: 'Created at',
    Icon: IconCalendarEvent,
  },
  {
    fieldId: 'city',
    label: 'City',
    Icon: IconMap,
  },
];
