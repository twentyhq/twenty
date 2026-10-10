import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type IconComponent,
  IconApi,
  IconCsv,
  IconGmail,
  IconGoogleCalendar,
  IconRobot,
  IconSettingsAutomation,
  IconUserCircle,
  IconWebhook,
} from 'twenty-ui/icon';

// A view saves the English name as its filter display value, so the label is translated when the filter is displayed
export const ACTOR_SOURCE_FILTER_OPTIONS: Array<{
  id: string;
  name: string;
  label: MessageDescriptor;
  AvatarIcon: IconComponent;
  isIconInverted?: boolean;
}> = [
  {
    id: 'MANUAL',
    name: 'User',
    label: msg`User`,
    AvatarIcon: IconUserCircle,
    isIconInverted: true,
  },
  {
    id: 'IMPORT',
    name: 'Import',
    label: msg`Import`,
    AvatarIcon: IconCsv,
    isIconInverted: true,
  },
  {
    id: 'API',
    name: 'Api',
    label: msg`API`,
    AvatarIcon: IconApi,
    isIconInverted: true,
  },
  {
    id: 'EMAIL',
    name: 'Email',
    label: msg`Email`,
    AvatarIcon: IconGmail,
  },
  {
    id: 'CALENDAR',
    name: 'Calendar',
    label: msg`Calendar`,
    AvatarIcon: IconGoogleCalendar,
  },
  {
    id: 'WORKFLOW',
    name: 'Workflow',
    label: msg`Workflow`,
    AvatarIcon: IconSettingsAutomation,
    isIconInverted: true,
  },
  {
    id: 'WEBHOOK',
    name: 'Webhook',
    label: msg`Webhook`,
    AvatarIcon: IconWebhook,
    isIconInverted: true,
  },
  {
    id: 'SYSTEM',
    name: 'System',
    label: msg`System`,
    AvatarIcon: IconRobot,
    isIconInverted: true,
  },
];
