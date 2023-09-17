import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUsers,
} from '@/ui/icon/index';
import { SortDefinition } from '@/ui/view-bar/types/SortDefinition';

export const companyAvailableSorts: SortDefinition[] = [
  {
    key: 'name',
    label: 'Name',
    Icon: IconBuildingSkyscraper,
  },
  {
    key: 'employees',
    label: 'Employees',
    Icon: IconUsers,
  },
  {
    key: 'domainName',
    label: 'Url',
    Icon: IconLink,
  },
  {
    key: 'address',
    label: 'Address',
    Icon: IconMap,
  },
  {
    key: 'createdAt',
    label: 'Creation',
    Icon: IconCalendarEvent,
  },
];
