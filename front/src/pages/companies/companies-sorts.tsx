import {
  FaCalendar,
  FaLink,
  FaMapPin,
  FaUsers,
  FaBuilding,
} from 'react-icons/fa';
import { Companies_Order_By } from '../../generated/graphql';
import { SortType } from '../../interfaces/sorts/interface';

export const availableSorts = [
  {
    key: 'name',
    label: 'Name',
    icon: <FaBuilding />,
    _type: 'default_sort',
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: <FaUsers />,
    _type: 'default_sort',
  },
  {
    key: 'domain_name',
    label: 'Url',
    icon: <FaLink />,
    _type: 'default_sort',
  },
  {
    key: 'address',
    label: 'Address',
    icon: <FaMapPin />,
    _type: 'default_sort',
  },
  {
    key: 'created_at',
    label: 'Creation',
    icon: <FaCalendar />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<Companies_Order_By>>;
