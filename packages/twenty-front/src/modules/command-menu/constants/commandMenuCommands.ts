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
    id: 'go-to-people',
    to: '/objects/people',
    label: 'برو به افراد',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'P',
    Icon: IconUser,
  },
  {
    id: 'go-to-companies',
    to: '/objects/companies',
    label: 'برو به شرکت ها',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'C',
    Icon: IconBuildingSkyscraper,
  },
  {
    id: 'go-to-activities',
    to: '/objects/opportunities',
    label: 'برو به فرصت ها',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'O',
    Icon: IconTargetArrow,
  },
  {
    id: 'go-to-settings',
    to: '/settings/profile',
    label: 'برو به تنظیمات',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'S',
    Icon: IconSettings,
  },
  {
    id: 'go-to-tasks',
    to: '/tasks',
    label: 'برو به وظایف',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'T',
    Icon: IconCheckbox,
  },
];
