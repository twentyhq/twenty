import { ObjectFieldItem } from '@/settings/objects/types/ObjectFieldItem';
import {
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBuildingSkyscraper,
  IconCurrencyDollar,
  IconFreeRights,
  IconGraph,
  IconHeadphones,
  IconLink,
  IconLuggage,
  IconPlane,
  IconTarget,
  IconUser,
  IconUserCircle,
  IconUsers,
} from '@/ui/icon';

export const activeObjectItems = [
  {
    name: 'Companies',
    singularName: 'company',
    Icon: IconBuildingSkyscraper,
    type: 'standard',
    fields: 23,
    instances: 165,
  },
  {
    name: 'People',
    singularName: 'person',
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

export const activeFieldItems: ObjectFieldItem[] = [
  {
    name: 'People',
    Icon: IconUser,
    type: 'standard',
    dataType: 'relation',
  },
  {
    name: 'URL',
    Icon: IconLink,
    type: 'standard',
    dataType: 'text',
  },
  {
    name: 'Linkedin',
    Icon: IconBrandLinkedin,
    type: 'standard',
    dataType: 'social',
  },
  {
    name: 'Account Owner',
    Icon: IconUserCircle,
    type: 'standard',
    dataType: 'teammate',
  },
  {
    name: 'Employees',
    Icon: IconUsers,
    type: 'custom',
    dataType: 'number',
  },
];

export const disabledFieldItems: ObjectFieldItem[] = [
  {
    name: 'ICP',
    Icon: IconTarget,
    type: 'standard',
    dataType: 'boolean',
  },
  {
    name: 'Twitter',
    Icon: IconBrandTwitter,
    type: 'standard',
    dataType: 'social',
  },
  {
    name: 'Annual revenue',
    Icon: IconCurrencyDollar,
    type: 'standard',
    dataType: 'number',
  },
  {
    name: 'Is public',
    Icon: IconGraph,
    type: 'standard',
    dataType: 'boolean',
  },
  {
    name: 'Free tier?',
    Icon: IconFreeRights,
    type: 'custom',
    dataType: 'boolean',
  },
  {
    name: 'Priority support',
    Icon: IconHeadphones,
    type: 'custom',
    dataType: 'boolean',
  },
];
