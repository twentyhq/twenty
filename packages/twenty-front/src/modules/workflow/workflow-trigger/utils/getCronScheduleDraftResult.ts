import { CRON_SCHEDULE_NUMERIC_FIELDS } from '@/workflow/workflow-trigger/constants/CronScheduleNumericFields';
import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CronExpressionParser } from 'cron-parser';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type CronScheduleDraftResult = {
  settings?: WorkflowCronTrigger['settings'];
  errors: Partial<Record<keyof CronScheduleDraft, string>>;
};

export const getCronScheduleDraftResult = (
  draft: CronScheduleDraft,
): CronScheduleDraftResult => {
  const fields = CRON_SCHEDULE_NUMERIC_FIELDS[draft.interval];
  const errors: CronScheduleDraftResult['errors'] = {};
  for (const { key, minimum, maximum } of fields) {
    const value = Number(draft[key]);
    if (
      !isNonEmptyString(draft[key].trim()) ||
      !Number.isInteger(value) ||
      value < minimum ||
      (isDefined(maximum) && value > maximum)
    ) {
      errors[key] = isDefined(maximum)
        ? t`Enter a whole number between ${minimum} and ${maximum}.`
        : t`Enter a whole number of at least ${minimum}.`;
    }
  }
  if (isNonEmptyArray(Object.keys(errors))) {
    return { errors };
  }

  const settings: WorkflowCronTrigger['settings'] = (() => {
    switch (draft.interval) {
      case 'DAYS':
        return {
          type: 'DAYS',
          schedule: {
            day: Number(draft.day),
            hour: Number(draft.hour),
            minute: Number(draft.minute),
          },
          outputSchema: {},
        };
      case 'HOURS':
        return {
          type: 'HOURS',
          schedule: { hour: Number(draft.hour), minute: Number(draft.minute) },
          outputSchema: {},
        };
      case 'MINUTES':
        return {
          type: 'MINUTES',
          schedule: { minute: Number(draft.minute) },
          outputSchema: {},
        };
      case 'CUSTOM':
        return { type: 'CUSTOM', pattern: draft.pattern, outputSchema: {} };
    }
  })();
  const pattern = convertScheduleToCronExpression({ settings });
  try {
    if (!isDefined(pattern) || !isNonEmptyString(pattern.trim())) {
      return { errors: { pattern: t`Enter a valid cron expression.` } };
    }
    CronExpressionParser.parse(pattern);
    return { settings, errors: {} };
  } catch {
    return {
      errors:
        draft.interval === 'CUSTOM'
          ? { pattern: t`Enter a valid cron expression.` }
          : {
              interval: t`This interval cannot be represented by a valid cron expression.`,
            },
    };
  }
};
