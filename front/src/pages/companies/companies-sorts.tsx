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
    icon: <IconBuildingSkyscraper size={16} />,
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: <IconUsers size={16} />,
  },
  {
    key: 'domainName',
    label: 'Url',
    icon: <IconLink size={16} />,
  },
  {
    key: 'address',
    label: 'Address',
    icon: <IconMap size={16} />,
  },
  {
    key: 'createdAt',
    label: 'Creation',
    icon: <IconCalendarEvent size={16} />,
  },
];
