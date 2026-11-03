import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type CronTriggerInterval } from '@/workflow/workflow-trigger/constants/CronTriggerIntervalOptions';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';

type CronScheduleNumericField = {
  key: keyof Pick<CronScheduleDraft, 'day' | 'hour' | 'minute'>;
  minimum: number;
  maximum?: number;
  label: MessageDescriptor;
  placeholder: MessageDescriptor;
};

export const CRON_SCHEDULE_NUMERIC_FIELDS: Record<
  CronTriggerInterval,
  CronScheduleNumericField[]
> = {
  DAYS: [
    {
      key: 'day',
      minimum: 1,
      label: msg`Days between triggers`,
      placeholder: msg`Enter a whole number of at least 1`,
    },
    {
      key: 'hour',
      minimum: 0,
      maximum: 23,
      label: msg`Trigger at hour (UTC)`,
      placeholder: msg`Enter a number between 0 and 23`,
    },
    {
      key: 'minute',
      minimum: 0,
      maximum: 59,
      label: msg`Trigger at minute (UTC)`,
      placeholder: msg`Enter a number between 0 and 59`,
    },
  ],
  HOURS: [
    {
      key: 'hour',
      minimum: 1,
      label: msg`Hours between triggers`,
      placeholder: msg`Enter a whole number of at least 1`,
    },
    {
      key: 'minute',
      minimum: 0,
      maximum: 59,
      label: msg`Trigger at minute (UTC)`,
      placeholder: msg`Enter a number between 0 and 59`,
    },
  ],
  MINUTES: [
    {
      key: 'minute',
      minimum: 1,
      maximum: 60,
      label: msg`Minutes between triggers`,
      placeholder: msg`Enter a number between 1 and 60`,
    },
  ],
  CUSTOM: [],
};
