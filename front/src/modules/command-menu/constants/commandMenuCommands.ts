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
    shortcuts: ['G', 'P'],
    Icon: IconUser,
  },
  {
    to: '/companies',
    label: 'Go to Companies',
    type: CommandType.Navigate,
    shortcuts: ['G', 'C'],
    Icon: IconBuildingSkyscraper,
  },
  {
    to: '/opportunities',
    label: 'Go to Opportunities',
    type: CommandType.Navigate,
    shortcuts: ['G', 'O'],
    Icon: IconTargetArrow,
  },
  {
    to: '/settings/profile',
    label: 'Go to Settings',
    type: CommandType.Navigate,
    shortcuts: ['G', 'S'],
    Icon: IconSettings,
  },
  {
    to: '/tasks',
    label: 'Go to Tasks',
    type: CommandType.Navigate,
    shortcuts: ['G', 'T'],
    Icon: IconCheckbox,
  },
];
