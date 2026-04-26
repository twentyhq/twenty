import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

export const useApplyAgentChatThreadUpdate = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const applyAgentChatThreadUpdate = (
    update: Partial<FlatAgentChatThread> & { id: string },
  ) => {
    // updateInDraft merges by id, but its signature requires complete entities.
    updateInDraft('agentChatThreads', [update as FlatAgentChatThread]);
    applyChanges();
  };

  return { applyAgentChatThreadUpdate };
};
