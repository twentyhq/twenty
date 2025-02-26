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
    label: 'رفتن به افراد',
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
    label: 'رفتن به شرکت‌ها',
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
    label: 'رفتن به فرصت‌ها',
    type: CommandType.Navigate,
    hotKeys: ['G', 'O'],
    Icon: IconTargetArrow,
    shouldCloseCommandMenuOnClick: true,
  },
  settings: {
    id: 'go-to-settings',
    to: getSettingsPath(SettingsPath.ProfilePage),
    label: 'رفتن به تنظیمات',
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
    label: 'رفتن به تسک‌ها',
    type: CommandType.Navigate,
    hotKeys: ['G', 'T'],
    Icon: IconCheckbox,
    shouldCloseCommandMenuOnClick: true,
  },
};
