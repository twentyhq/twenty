import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui';

import i18n from '~/utils/i18n';
import { Command, CommandType } from '../types/Command';

export const COMMAND_MENU_NAVIGATE_COMMANDS: { [key: string]: Command } = {
  people: {
    id: 'go-to-people',
    to: '/objects/people',
    label: `${i18n.t('goTo')} People`,
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'P',
    Icon: IconUser,
    shouldCloseCommandMenuOnClick: true,
  },
  companies: {
    id: 'go-to-companies',
    to: '/objects/companies',
    label: `${i18n.t('goTo')} Companies`,
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'C',
    Icon: IconBuildingSkyscraper,
    shouldCloseCommandMenuOnClick: true,
  },
  opportunities: {
    id: 'go-to-activities',
    to: '/objects/opportunities',
    label: `${i18n.t('goTo')} Opportunities`,
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'O',
    Icon: IconTargetArrow,
    shouldCloseCommandMenuOnClick: true,
  },
  settings: {
    id: 'go-to-settings',
    to: '/settings/profile',
    label: `${i18n.t('goTo')} Settings`,
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'S',
    Icon: IconSettings,
    shouldCloseCommandMenuOnClick: true,
  },
  tasks: {
    id: 'go-to-tasks',
    to: '/objects/tasks',
    label: `${i18n.t('goTo')} Tasks`,
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'T',
    Icon: IconCheckbox,
    shouldCloseCommandMenuOnClick: true,
  },
};
