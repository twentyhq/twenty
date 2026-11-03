import { type CoreAgentEditSession } from '@/object-core/agents/types/CoreAgentEditSession';
import { type CoreAgentSettings } from '@/object-core/agents/types/CoreAgentSettings';
import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const reconcileCoreAgentScheduleDrafts = ({
  scheduleDrafts,
  draft,
}: {
  scheduleDrafts: CoreAgentEditSession['scheduleDrafts'];
  draft: Pick<CoreAgentSettings, 'triggers'>;
}): Record<string, CronScheduleDraft> | undefined => {
  if (!isDefined(scheduleDrafts)) {
    return undefined;
  }
  const retained: Record<string, CronScheduleDraft> = {};
  const currentTriggers = new Map(
    draft.triggers
      .map(getCoreAgentEditableTrigger)
      .filter(isDefined)
      .map((trigger) => [trigger.id, trigger]),
  );
  for (const [triggerId, scheduleDraft] of Object.entries(scheduleDrafts)) {
    const trigger = currentTriggers.get(triggerId);
    if (trigger?.type !== 'CRON') {
      continue;
    }
    const result = getCronScheduleDraftResult(scheduleDraft);
    const shouldRetain =
      !isDefined(result.settings) ||
      trigger.settings.pattern ===
        convertScheduleToCronExpression({ settings: result.settings });
    if (shouldRetain) {
      retained[triggerId] = scheduleDraft;
    }
  }
  return isNonEmptyArray(Object.keys(retained)) ? retained : undefined;
};
