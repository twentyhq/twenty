import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconClockPlay,
  type IconComponent,
  IconHours24,
  IconTimeDuration60,
  IconBrandDaysCounter,
} from 'twenty-ui/icon';
export type CronTriggerInterval = 'DAYS' | 'HOURS' | 'MINUTES' | 'CUSTOM';

export const CRON_TRIGGER_INTERVAL_OPTIONS: Array<{
  label: MessageDescriptor;
  value: CronTriggerInterval;
  Icon: IconComponent;
}> = [
  {
    label: msg`Days`,
    value: 'DAYS',
    Icon: IconBrandDaysCounter,
  },
  {
    label: msg`Hours`,
    value: 'HOURS',
    Icon: IconHours24,
  },
  {
    label: msg`Minutes`,
    value: 'MINUTES',
    Icon: IconTimeDuration60,
  },
  {
    label: msg`Cron (Custom)`,
    value: 'CUSTOM',
    Icon: IconClockPlay,
  },
];
