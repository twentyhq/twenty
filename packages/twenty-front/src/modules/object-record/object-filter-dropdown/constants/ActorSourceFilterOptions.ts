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

// Source names are stored in saved filters; label descriptors provide localized display text.
export const ACTOR_SOURCE_FILTER_OPTIONS: Array<{
  id: string;
  name: string;
  label: MessageDescriptor;
  AvatarIcon: IconComponent;
  isIconInverted?: boolean;
}> = [
  {
    id: 'MANUAL',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'User',
    label: msg`User`,
    AvatarIcon: IconUserCircle,
    isIconInverted: true,
  },
  {
    id: 'IMPORT',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'Import',
    label: msg`Import`,
    AvatarIcon: IconCsv,
    isIconInverted: true,
  },
  {
    id: 'API',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'Api',
    label: msg`API`,
    AvatarIcon: IconApi,
    isIconInverted: true,
  },
  {
    id: 'EMAIL',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'Email',
    label: msg`Email`,
    AvatarIcon: IconGmail,
  },
  {
    id: 'CALENDAR',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'Calendar',
    label: msg`Calendar`,
    AvatarIcon: IconGoogleCalendar,
  },
  {
    id: 'WORKFLOW',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'Workflow',
    label: msg`Workflow`,
    AvatarIcon: IconSettingsAutomation,
    isIconInverted: true,
  },
  {
    id: 'WEBHOOK',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'Webhook',
    label: msg`Webhook`,
    AvatarIcon: IconWebhook,
    isIconInverted: true,
  },
  {
    id: 'SYSTEM',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    name: 'System',
    label: msg`System`,
    AvatarIcon: IconRobot,
    isIconInverted: true,
  },
];
