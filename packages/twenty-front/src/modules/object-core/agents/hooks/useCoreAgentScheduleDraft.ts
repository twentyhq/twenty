import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { useUpdateCoreAgentEditSession } from '@/object-core/agents/hooks/useUpdateCoreAgentEditSession';
import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { getCoreAgentScheduleDraftFromPattern } from '@/object-core/agents/utils/getCoreAgentScheduleDraftFromPattern';
import { updateCoreAgentTrigger } from '@/object-core/agents/utils/updateCoreAgentTrigger';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useCoreAgentScheduleDraft = ({
  agentId,
  triggerId,
}: {
  agentId: string;
  triggerId: string;
}) => {
  const { sessionAtom } = useCoreAgentEditScope(agentId);
  const session = useAtomValue(sessionAtom);
  const { updateCoreAgentEditSession } = useUpdateCoreAgentEditSession({
    agentId,
  });
  const trigger = session?.draft.triggers
    .map(getCoreAgentEditableTrigger)
    .find((item) => item?.id === triggerId);
  const value =
    session?.scheduleDrafts?.[triggerId] ??
    (trigger?.type === 'CRON'
      ? getCoreAgentScheduleDraftFromPattern(trigger.settings.pattern)
      : undefined);
  const updateScheduleDraft = (
    update: (current: CronScheduleDraft) => CronScheduleDraft,
  ) => {
    updateCoreAgentEditSession((current) => {
      const currentTrigger = current.draft.triggers
        .map(getCoreAgentEditableTrigger)
        .find((item) => item?.id === triggerId);
      if (currentTrigger?.type !== 'CRON') {
        return current;
      }
      const currentDraft =
        current.scheduleDrafts?.[triggerId] ??
        getCoreAgentScheduleDraftFromPattern(currentTrigger.settings.pattern);
      const nextDraft = update(currentDraft);
      const result = getCronScheduleDraftResult(nextDraft);
      const pattern = isDefined(result.settings)
        ? convertScheduleToCronExpression({ settings: result.settings })
        : nextDraft.interval === 'CUSTOM'
          ? nextDraft.pattern
          : undefined;
      const triggers = isDefined(pattern)
        ? updateCoreAgentTrigger({
            triggers: current.draft.triggers,
            triggerId,
            update: (item) =>
              item.type === 'CRON'
                ? { ...item, settings: { ...item.settings, pattern } }
                : item,
          })
        : current.draft.triggers;
      return {
        ...current,
        scheduleDrafts: { ...current.scheduleDrafts, [triggerId]: nextDraft },
        draft: { ...current.draft, triggers },
        fieldRevisions: {
          ...current.fieldRevisions,
          triggers: current.fieldRevisions.triggers + 1,
        },
      };
    });
  };
  return { value, updateScheduleDraft };
};
