import { isDefined } from 'twenty-shared/utils';

import { type WorkflowCronTriggerSchedule } from '@/workflow/workflow-trigger/types/WorkflowCronTriggerSchedule';

// No leading zeros, so a matched pattern computes back to the same string
const NUMBER = '(0|[1-9]\\d*)';

const DAYS_PATTERN = new RegExp(`^${NUMBER} ${NUMBER} \\*/${NUMBER} \\* \\*$`);
const HOURS_PATTERN = new RegExp(`^${NUMBER} \\*/${NUMBER} \\* \\* \\*$`);
const MINUTES_PATTERN = new RegExp(`^\\*/${NUMBER} \\* \\* \\* \\*$`);

const isMinuteOfHour = (value: number) => value >= 0 && value <= 59;

const matchEditorSchedule = (
  pattern: string,
): WorkflowCronTriggerSchedule | null => {
  const daysMatch = pattern.match(DAYS_PATTERN);

  if (isDefined(daysMatch)) {
    const [minute, hour, day] = daysMatch.slice(1).map(Number);

    return day >= 1 && hour <= 23 && isMinuteOfHour(minute)
      ? { type: 'DAYS', schedule: { day, hour, minute } }
      : null;
  }

  const hoursMatch = pattern.match(HOURS_PATTERN);

  if (isDefined(hoursMatch)) {
    const [minute, hour] = hoursMatch.slice(1).map(Number);

    return hour >= 1 && isMinuteOfHour(minute)
      ? { type: 'HOURS', schedule: { hour, minute } }
      : null;
  }

  const minutesMatch = pattern.match(MINUTES_PATTERN);

  if (isDefined(minutesMatch)) {
    const minute = Number(minutesMatch[1]);

    return minute >= 1 && minute <= 60
      ? { type: 'MINUTES', schedule: { minute } }
      : null;
  }

  return null;
};

export const computeWorkflowCronScheduleFromCronPattern = (
  pattern: string,
): WorkflowCronTriggerSchedule =>
  matchEditorSchedule(pattern) ?? { type: 'CUSTOM', pattern };
