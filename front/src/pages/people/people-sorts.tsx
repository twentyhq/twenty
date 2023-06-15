import { SortType } from '@/filters-and-sorts/interfaces/sorts/interface';
import {
  IconBuildingSkyscraper,
  IconCalendar,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icons/index';
import {
  PersonOrderByWithRelationInput as People_Order_By,
  SortOrder as Order_By,
} from '~/generated/graphql';

export const availableSorts = [
  {
    key: 'fullname',
    label: 'People',
    icon: <IconUser size={16} />,
    _type: 'custom_sort',
    orderByTemplates: [
      (order: Order_By) => ({
        firstname: order,
      }),
      (order: Order_By) => ({
        lastname: order,
      }),
    ],
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <IconBuildingSkyscraper size={16} />,
    _type: 'custom_sort',
    orderByTemplates: [(order: Order_By) => ({ company: { name: order } })],
  },
  {
    key: 'email',
    label: 'Email',
    icon: <IconMail size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: <IconPhone size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'createdAt',
    label: 'Created at',
    icon: <IconCalendar size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'city',
    label: 'City',
    icon: <IconMap size={16} />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<People_Order_By>>;
