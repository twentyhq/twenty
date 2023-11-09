import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from '@/ui/display/icon';

import { Command, CommandType } from '../types/Command';

export const commandMenuCommands: Command[] = [
  {
    to: '/people',
    label: 'Go to People',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'P',
    Icon: IconUser,
  },
  {
    to: '/companies',
    label: 'Go to Companies',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'C',
    Icon: IconBuildingSkyscraper,
  },
  {
    to: '/opportunities',
    label: 'Go to Opportunities',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'O',
    Icon: IconTargetArrow,
  },
  {
    to: '/settings/profile',
    label: 'Go to Settings',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'S',
    Icon: IconSettings,
  },
  {
    to: '/tasks',
    label: 'Go to Tasks',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'T',
    Icon: IconCheckbox,
  },
];
