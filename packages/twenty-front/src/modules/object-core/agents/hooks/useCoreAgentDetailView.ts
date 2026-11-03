import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { coreAgentDetailViewFamilyState } from '@/object-core/agents/states/coreAgentDetailViewFamilyState';
import { useAtomValue } from 'jotai';

export const useCoreAgentDetailView = ({
  agentId,
}: { agentId?: string } = {}) => {
  const { agentId: sessionAgentId, scopeId } = useCoreAgentEditScope(agentId);
  return useAtomValue(
    coreAgentDetailViewFamilyState.getAtom(sessionAgentId, scopeId),
  );
};
