import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';
import { getCronScheduleDraftFromSettings } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftFromSettings';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { isDefined } from 'twenty-shared/utils';

const MINUTES_INTERVAL_PATTERN = /^\*\/(\d+) \* \* \* \*$/;
const HOURS_INTERVAL_PATTERN = /^(\d+) \*\/(\d+) \* \* \*$/;
const DAYS_INTERVAL_PATTERN = /^(\d+) (\d+) \*\/(\d+) \* \*$/;

export const getCoreAgentScheduleDraftFromPattern = (
  pattern: string,
): CronScheduleDraft => {
  const custom = getCronScheduleDraftFromSettings({
    type: 'CUSTOM',
    pattern,
    outputSchema: {},
  });
  const candidate = (() => {
    const minutesMatch = pattern.match(MINUTES_INTERVAL_PATTERN);
    if (isDefined(minutesMatch)) {
      const [, minute] = minutesMatch;
      return {
        ...custom,
        interval: 'MINUTES',
        minute,
      } satisfies CronScheduleDraft;
    }
    const hoursMatch = pattern.match(HOURS_INTERVAL_PATTERN);
    if (isDefined(hoursMatch)) {
      const [, minute, hour] = hoursMatch;
      return {
        ...custom,
        interval: 'HOURS',
        minute,
        hour,
      } satisfies CronScheduleDraft;
    }
    const daysMatch = pattern.match(DAYS_INTERVAL_PATTERN);
    if (isDefined(daysMatch)) {
      const [, minute, hour, day] = daysMatch;
      return {
        ...custom,
        interval: 'DAYS',
        minute,
        hour,
        day,
      } satisfies CronScheduleDraft;
    }
    return custom;
  })();
  return isDefined(getCronScheduleDraftResult(candidate).settings)
    ? candidate
    : custom;
};
