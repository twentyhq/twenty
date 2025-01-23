import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui';

import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { getAppPath } from '~/utils/navigation/getAppPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { Command, CommandType } from '../types/Command';

export const COMMAND_MENU_NAVIGATE_COMMANDS: { [key: string]: Command } = {
  people: {
    id: 'go-to-people',
    to: getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Person,
    }),
    label: 'Go to People',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'P',
    Icon: IconUser,
    shouldCloseCommandMenuOnClick: true,
  },
  companies: {
    id: 'go-to-companies',
    to: getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Company,
    }),
    label: 'Go to Companies',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'C',
    Icon: IconBuildingSkyscraper,
    shouldCloseCommandMenuOnClick: true,
  },
  opportunities: {
    id: 'go-to-activities',
    to: getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Opportunity,
    }),
    label: 'Go to Opportunities',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'O',
    Icon: IconTargetArrow,
    shouldCloseCommandMenuOnClick: true,
  },
  settings: {
    id: 'go-to-settings',
    to: getSettingsPath(SettingsPath.ProfilePage),
    label: 'Go to Settings',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'S',
    Icon: IconSettings,
    shouldCloseCommandMenuOnClick: true,
  },
  tasks: {
    id: 'go-to-tasks',
    to: getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Task,
    }),
    label: 'Go to Tasks',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'T',
    Icon: IconCheckbox,
    shouldCloseCommandMenuOnClick: true,
  },
};
