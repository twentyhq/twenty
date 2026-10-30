import { styled } from '@linaria/react';
import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { CoreAgentTriggerForm } from '@/object-core/agents/components/CoreAgentTriggerForm';
import { CoreAgentTriggerInstructions } from '@/object-core/agents/components/CoreAgentTriggerInstructions';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { coreAgentDiscardCountFamilyState } from '@/object-core/agents/states/coreAgentDiscardCountFamilyState';
import { parseCoreAgentTriggers } from '@/object-core/agents/utils/parseCoreAgentTriggers';
import { replaceCoreAgentTrigger } from '@/object-core/agents/utils/replaceCoreAgentTrigger';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

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

  const updateTrigger = (nextTrigger: AgentTrigger) =>
    updateDraft((currentDraft) => ({
      ...currentDraft,
      triggers: replaceCoreAgentTrigger({
        triggers: currentDraft.triggers,
        nextTrigger,
      }),
    }));

  return (
    <StyledContainer>
      <CoreAgentTriggerForm
        key={`${trigger.id}-${coreAgentDiscardCount}`}
        trigger={trigger}
        isReadOnly={isReadOnly}
        onTriggerChange={updateTrigger}
      />
      <CoreAgentTriggerInstructions
        trigger={trigger}
        isReadOnly={isReadOnly}
        onTriggerChange={updateTrigger}
      />
    </StyledContainer>
  );
};
