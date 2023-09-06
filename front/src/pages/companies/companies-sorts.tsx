import { SortType } from '@/ui/filter-n-sort/types/interface';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUsers,
} from '@/ui/icon/index';
import { CompanyOrderByWithRelationInput as Companies_Order_By } from '~/generated/graphql';

export const availableSorts: SortType<Companies_Order_By>[] = [
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
