import {
  IconClockPlay,
  type IconComponent,
  IconHours24,
  IconTimeDuration60,
  IconBrandDaysCounter,
} from 'twenty-ui/display';
export type CronTriggerInterval = 'DAYS' | 'HOURS' | 'MINUTES' | 'CUSTOM';

export const CRON_TRIGGER_INTERVAL_OPTIONS: Array<{
  label: string;
  value: CronTriggerInterval;
  Icon: IconComponent;
}> = [
  {
    label: 'Days',
    value: 'DAYS',
    Icon: IconBrandDaysCounter,
  },
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
