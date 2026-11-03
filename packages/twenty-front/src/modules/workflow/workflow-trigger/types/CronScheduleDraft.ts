import { type CronTriggerInterval } from '@/workflow/workflow-trigger/constants/CronTriggerIntervalOptions';

export type CronScheduleDraft = {
  interval: CronTriggerInterval;
  pattern: string;
  day: string;
  hour: string;
  minute: string;
};
