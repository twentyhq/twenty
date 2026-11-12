import { isDefined } from 'twenty-shared/utils';

import { CoreAgentTriggerForm } from '@/object-core/agents/components/CoreAgentTriggerForm';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { coreAgentDiscardCountFamilyState } from '@/object-core/agents/states/coreAgentDiscardCountFamilyState';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { replaceCoreAgentTrigger } from '@/object-core/agents/utils/replaceCoreAgentTrigger';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

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
  const coreAgentDiscardCount = useAtomFamilyStateValue(
    coreAgentDiscardCountFamilyState,
    agent.id,
  );

  const trigger = parseCoreAgentTriggers(draft.triggers).find(
    ({ id }) => id === triggerId,
  );

  if (!isDefined(trigger)) {
    return null;
  }

  return (
    <CoreAgentTriggerForm
      key={`${trigger.id}-${coreAgentDiscardCount}`}
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
