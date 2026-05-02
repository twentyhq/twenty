import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

type AgentChatThreadDraftUpdate = Partial<FlatAgentChatThread> & {
  id: string;
};

export const useApplyAgentChatThreadUpdate = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const applyAgentChatThreadUpdate = (update: AgentChatThreadDraftUpdate) => {
    updateInDraft('agentChatThreads', [update as FlatAgentChatThread]);
    applyChanges();
  };

  return { applyAgentChatThreadUpdate };
};
