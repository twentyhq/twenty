import {
  FaRegBuilding,
  FaCalendar,
  FaEnvelope,
  FaRegUser,
  FaMapPin,
  FaPhone,
} from 'react-icons/fa';
import { Order_By, People_Order_By } from '../../generated/graphql';
import { SortType } from '../../interfaces/sorts/interface';

export const availableSorts = [
  {
    key: 'fullname',
    label: 'People',
    icon: <FaRegUser />,
    _type: 'custom_sort',
    orderByTemplate: (order: Order_By) => ({
      firstname: order,
      lastname: order,
    }),
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <FaRegBuilding />,
    _type: 'custom_sort',
    orderByTemplate: (order: Order_By) => ({ company: { name: order } }),
  },
  {
    key: 'email',
    label: 'Email',
    icon: <FaEnvelope />,
    _type: 'default_sort',
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: <FaPhone />,
    _type: 'default_sort',
  },
  {
    key: 'created_at',
    label: 'Created at',
    icon: <FaCalendar />,
    _type: 'default_sort',
  },
  {
    key: 'city',
    label: 'City',
    icon: <FaMapPin />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<People_Order_By>>;
