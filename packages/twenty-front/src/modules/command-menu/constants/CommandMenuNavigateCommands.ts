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
    hotKeys: ['G', 'P'],
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
    hotKeys: ['G', 'C'],
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
    hotKeys: ['G', 'O'],
    Icon: IconTargetArrow,
    shouldCloseCommandMenuOnClick: true,
  },
  settings: {
    id: 'go-to-settings',
    to: getSettingsPath(SettingsPath.ProfilePage),
    label: 'Go to Settings',
    type: CommandType.Navigate,
    hotKeys: ['G', 'S'],
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
    hotKeys: ['G', 'T'],
    Icon: IconCheckbox,
    shouldCloseCommandMenuOnClick: true,
  },
};
