import { SortDefinition } from '@/ui/data/view-bar/types/SortDefinition';
import { SortDirection } from '@/ui/data/view-bar/types/SortDirection';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/display/icon/index';

export const peopleAvailableSorts: SortDefinition[] = [
  {
    key: 'fullname',
    label: 'People',
    Icon: IconUser,

    getOrderByTemplate: (direction: SortDirection) => [
      { firstName: direction },
      { lastName: direction },
    ],
  },
  {
    key: 'company_name',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    getOrderByTemplate: (direction: SortDirection) => [
      { company: { name: direction } },
    ],
  },
  {
    key: 'email',
    label: 'Email',
    Icon: IconMail,
  },
  {
    key: 'phone',
    label: 'Phone',
    Icon: IconPhone,
  },
  {
    key: 'createdAt',
    label: 'Created at',
    Icon: IconCalendarEvent,
  },
  {
    key: 'city',
    label: 'City',
    Icon: IconMap,
  },
];
