import {
  IconComponent,
  Icon24Hours,
  IconTimeDuration60,
  IconTimeDuration30,
  IconClockPlay,
} from 'twenty-ui';

export type CronTriggerInterval = 'HOURS' | 'MINUTES' | 'SECONDS' | 'CUSTOM';

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
    label: 'Seconds',
    value: 'SECONDS',
    Icon: IconTimeDuration30,
  },
  {
    label: 'Cron (Custom)',
    value: 'CUSTOM',
    Icon: IconClockPlay,
  },
];
