import {
  IconBuildingSkyscraper,
  IconLuggage,
  IconPlane,
  IconUser,
} from '@/ui/icon';

export const activeObjectItems = [
  {
    name: 'Companies',
    Icon: IconBuildingSkyscraper,
    type: 'standard',
    fields: 23,
    instances: 165,
  },
  {
    name: 'People',
    Icon: IconUser,
    type: 'standard',
    fields: 16,
    instances: 462,
  },
];

export const disabledObjectItems = [
  {
    name: 'Travels',
    Icon: IconLuggage,
    type: 'custom',
    fields: 23,
    instances: 165,
  },
  {
    name: 'Flights',
    Icon: IconPlane,
    type: 'custom',
    fields: 23,
    instances: 165,
  },
];
