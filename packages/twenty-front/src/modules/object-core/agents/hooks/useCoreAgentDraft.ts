import { coreAgentDraftFamilyState } from '@/object-core/agents/states/coreAgentDraftFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentDraft } from '@/object-core/agents/types/CoreAgentDraft';
import { buildCoreAgentDraft } from '@/object-core/agents/utils/buildCoreAgentDraft';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useCoreAgentDraft = (agent: CoreAgent) => {
  const coreAgentDraft = useAtomFamilyStateValue(
    coreAgentDraftFamilyState,
    agent.id,
  );
  const setCoreAgentDraft = useSetAtomFamilyState(
    coreAgentDraftFamilyState,
    agent.id,
  );

  const updateDraft = (
    getNextDraft: (draft: CoreAgentDraft) => CoreAgentDraft,
  ) =>
    setCoreAgentDraft((currentDraft) =>
      getNextDraft(currentDraft ?? buildCoreAgentDraft(agent)),
    );

  return {
    draft: coreAgentDraft ?? buildCoreAgentDraft(agent),
    updateDraft,
    resetDraft: () => setCoreAgentDraft(undefined),
  };
};
