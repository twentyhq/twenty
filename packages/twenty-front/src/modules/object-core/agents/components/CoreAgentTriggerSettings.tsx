import { isDefined } from 'twenty-shared/utils';

import { CoreAgentTriggerForm } from '@/object-core/agents/components/CoreAgentTriggerForm';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { replaceCoreAgentTrigger } from '@/object-core/agents/utils/replaceCoreAgentTrigger';

type CoreAgentTriggerSettingsProps = {
  agent: CoreAgent;
  triggerId: string;
};

export const CoreAgentTriggerSettings = ({
  agent,
  triggerId,
}: CoreAgentTriggerSettingsProps) => {
  const isReadOnly = useIsCoreAgentReadOnly(agent);
  const { draft, updateDraft } = useCoreAgentDraft(agent);

  const trigger = parseCoreAgentTriggers(draft.triggers).find(
    ({ id }) => id === triggerId,
  );

  if (!isDefined(trigger)) {
    return null;
  }

  return (
    <CoreAgentTriggerForm
      key={trigger.id}
      trigger={trigger}
      isReadOnly={isReadOnly}
      onTriggerChange={(nextTrigger) =>
        updateDraft((currentDraft) => ({
          ...currentDraft,
          triggers: replaceCoreAgentTrigger({
            triggers: currentDraft.triggers,
            nextTrigger,
          }),
        }))
      }
    />
  );
};
