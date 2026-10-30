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
import { doNotTranslate } from 'twenty-shared/i18n';

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
    name: doNotTranslate('User'),
    label: msg`User`,
    AvatarIcon: IconUserCircle,
    isIconInverted: true,
  },
  {
    id: 'IMPORT',
    name: doNotTranslate('Import'),
    label: msg`Import`,
    AvatarIcon: IconCsv,
    isIconInverted: true,
  },
  {
    id: 'API',
    name: doNotTranslate('Api'),
    label: msg`API`,
    AvatarIcon: IconApi,
    isIconInverted: true,
  },
  {
    id: 'EMAIL',
    name: doNotTranslate('Email'),
    label: msg`Email`,
    AvatarIcon: IconGmail,
  },
  {
    id: 'CALENDAR',
    name: doNotTranslate('Calendar'),
    label: msg`Calendar`,
    AvatarIcon: IconGoogleCalendar,
  },
  {
    id: 'WORKFLOW',
    name: doNotTranslate('Workflow'),
    label: msg`Workflow`,
    AvatarIcon: IconSettingsAutomation,
    isIconInverted: true,
  },
  {
    id: 'WEBHOOK',
    name: doNotTranslate('Webhook'),
    label: msg`Webhook`,
    AvatarIcon: IconWebhook,
    isIconInverted: true,
  },
  {
    id: 'SYSTEM',
    name: doNotTranslate('System'),
    label: msg`System`,
    AvatarIcon: IconRobot,
    isIconInverted: true,
  },
];
