import { SortType } from '@/ui/filter-n-sort/types/interface';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icon/index';
import {
  PersonOrderByWithRelationInput as People_Order_By,
  SortOrder as Order_By,
} from '~/generated/graphql';

export const availableSorts: SortType<People_Order_By>[] = [
  {
    key: 'fullname',
    label: 'People',
    Icon: IconUser,

    orderByTemplate: (order: Order_By) => [
      { firstName: order },
      { lastName: order },
    ],
  },
  {
    key: 'company_name',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    orderByTemplate: (order: Order_By) => [{ company: { name: order } }],
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
