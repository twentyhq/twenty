import {
  IconComponent,
  Icon24Hours,
  IconTimeDuration60,
  IconClockPlay,
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
    Icon: Icon24Hours,
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
