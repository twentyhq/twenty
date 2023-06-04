import {
  TbBuilding,
  TbCalendar,
  TbLink,
  TbMapPin,
  TbSum,
} from 'react-icons/tb';

import { SortType } from '@/filters-and-sorts/interfaces/sorts/interface';
import { CompanyOrderByWithRelationInput as Companies_Order_By } from '~/generated/graphql';

export const availableSorts = [
  {
    key: 'name',
    label: 'Name',
    icon: <TbBuilding size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: <TbSum size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'domainName',
    label: 'Url',
    icon: <TbLink size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'address',
    label: 'Address',
    icon: <TbMapPin size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'createdAt',
    label: 'Creation',
    icon: <TbCalendar size={16} />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<Companies_Order_By>>;
