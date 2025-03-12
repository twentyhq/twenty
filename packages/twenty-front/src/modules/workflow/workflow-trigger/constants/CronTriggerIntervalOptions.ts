import {
  IconClockPlay,
  IconComponent,
  IconHours24,
  IconTimeDuration60,
} from 'twenty-ui';

export type CronTriggerInterval = 'HOURS' | 'MINUTES' | 'CUSTOM';

export const CRON_TRIGGER_INTERVAL_OPTIONS: Array<{
  label: string;
  value: CronTriggerInterval;
  Icon: IconComponent;
}> = [
  {
    label: 'Hours',
    value: 'HOURS',
    Icon: IconHours24,
  },
  {
    label: 'Minutes',
    value: 'MINUTES',
    Icon: IconTimeDuration60,
  },
  {
    label: 'Cron (Custom)',
    value: 'CUSTOM',
    Icon: IconClockPlay,
  },
];
