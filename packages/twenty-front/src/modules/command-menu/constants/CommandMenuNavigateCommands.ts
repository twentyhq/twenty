import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui';

import { Command, CommandType } from '../types/Command';

export const COMMAND_MENU_NAVIGATE_COMMANDS: { [key: string]: Command } = {
  people: {
    id: 'go-to-people',
    to: '/objects/people',
    label: 'Go to People',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'P',
    Icon: IconUser,
  },
  companies: {
    id: 'go-to-companies',
    to: '/objects/companies',
    label: 'Go to Companies',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'C',
    Icon: IconBuildingSkyscraper,
  },
  opportunities: {
    id: 'go-to-activities',
    to: '/objects/opportunities',
    label: 'Go to Opportunities',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'O',
    Icon: IconTargetArrow,
  },
  settings: {
    id: 'go-to-settings',
    to: '/settings/profile',
    label: 'Go to Settings',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'S',
    Icon: IconSettings,
  },
  tasks: {
    id: 'go-to-tasks',
    to: '/objects/tasks',
    label: 'Go to Tasks',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'T',
    Icon: IconCheckbox,
  },
};
