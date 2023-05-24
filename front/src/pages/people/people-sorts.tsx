import {
  SortOrder as Order_By,
  PersonOrderByWithRelationInput as People_Order_By,
} from '../../generated/graphql';
import { SortType } from '../../interfaces/sorts/interface';
import {
  TbBuilding,
  TbCalendar,
  TbMail,
  TbMapPin,
  TbPhone,
  TbUser,
} from 'react-icons/tb';

export const availableSorts = [
  {
    key: 'fullname',
    label: 'People',
    icon: <TbUser size={16} />,
    _type: 'custom_sort',
    orderByTemplate: (order: Order_By) => ({
      firstname: order,
      lastname: order,
    }),
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <TbBuilding size={16} />,
    _type: 'custom_sort',
    orderByTemplate: (order: Order_By) => ({ company: { name: order } }),
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
