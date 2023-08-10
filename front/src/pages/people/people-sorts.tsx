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
    icon: <IconUser size={16} />,

    orderByTemplate: (order: Order_By) => [
      { firstName: order },
      { lastName: order },
    ],
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <IconBuildingSkyscraper size={16} />,

    orderByTemplate: (order: Order_By) => [{ company: { name: order } }],
  },
  {
    key: 'email',
    label: 'Email',
    icon: <IconMail size={16} />,
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: <IconPhone size={16} />,
  },
  {
    key: 'createdAt',
    label: 'Created at',
    icon: <IconCalendarEvent size={16} />,
  },
  {
    key: 'city',
    label: 'City',
    icon: <IconMap size={16} />,
  },
];
