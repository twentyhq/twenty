import { SortType } from '@/filters-and-sorts/interfaces/sorts/interface';
import {
  IconBuilding,
  IconCalendar,
  IconLink,
  IconMapPin,
  IconSum,
} from '@/ui/icons/index';
import { CompanyOrderByWithRelationInput as Companies_Order_By } from '~/generated/graphql';

export const availableSorts = [
  {
    key: 'name',
    label: 'Name',
    icon: <IconBuilding size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: <IconSum size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'domainName',
    label: 'Url',
    icon: <IconLink size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'address',
    label: 'Address',
    icon: <IconMapPin size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'createdAt',
    label: 'Creation',
    icon: <IconCalendar size={16} />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<Companies_Order_By>>;
