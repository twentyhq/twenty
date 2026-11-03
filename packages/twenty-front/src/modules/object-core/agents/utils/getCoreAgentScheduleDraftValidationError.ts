import { type CoreAgentEditSession } from '@/object-core/agents/types/CoreAgentEditSession';
import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { isDefined } from 'twenty-shared/utils';

export const getCoreAgentScheduleDraftValidationError = ({
  draft,
  scheduleDrafts,
}: Pick<CoreAgentEditSession, 'draft' | 'scheduleDrafts'>): string | null => {
  const triggersById = new Map(
    draft.triggers
      .map(getCoreAgentEditableTrigger)
      .filter(isDefined)
      .map((trigger) => [trigger.id, trigger]),
  );
  for (const [triggerId, scheduleDraft] of Object.entries(
    scheduleDrafts ?? {},
  )) {
    if (triggersById.get(triggerId)?.type !== 'CRON') {
      continue;
    }
    const { errors } = getCronScheduleDraftResult(scheduleDraft);
    const error =
      errors.interval ??
      errors.pattern ??
      errors.day ??
      errors.hour ??
      errors.minute;
    if (isDefined(error)) {
      return error;
    }
  }
  return null;
};
