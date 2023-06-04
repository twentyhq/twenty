import {
  TbBuilding,
  TbCalendar,
  TbMail,
  TbMapPin,
  TbPhone,
  TbUser,
} from 'react-icons/tb';

import { SortType } from '@/filters-and-sorts/interfaces/sorts/interface';
import {
  PersonOrderByWithRelationInput as People_Order_By,
  SortOrder as Order_By,
} from '~/generated/graphql';

export const availableSorts = [
  {
    key: 'fullname',
    label: 'People',
    icon: <TbUser size={16} />,
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
    icon: <TbBuilding size={16} />,
    _type: 'custom_sort',
    orderByTemplates: [(order: Order_By) => ({ company: { name: order } })],
  },
  {
    key: 'email',
    label: 'Email',
    icon: <TbMail size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: <TbPhone size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'createdAt',
    label: 'Created at',
    icon: <TbCalendar size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'city',
    label: 'City',
    icon: <TbMapPin size={16} />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<People_Order_By>>;
