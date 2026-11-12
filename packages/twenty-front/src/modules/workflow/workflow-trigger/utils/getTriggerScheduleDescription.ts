import { type Locale } from 'date-fns';

import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { describeCronExpression } from '~/utils/cron-to-human/describeCronExpression';
import { t } from '@lingui/core/macro';

export const getTriggerScheduleDescription = (
  trigger: WorkflowCronTrigger,
  localeCatalog?: Locale,
): string | null => {
  const cronExpression = trigger.settings.pattern;

  if (!cronExpression) {
    return null;
  }

  try {
    return describeCronExpression(
      cronExpression,
      { use24HourTimeFormat: true },
      localeCatalog,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : t`Invalid cron expression`;
    return errorMessage;
  }
};
