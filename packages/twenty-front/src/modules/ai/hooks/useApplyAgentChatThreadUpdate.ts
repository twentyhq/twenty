import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

type AgentChatThreadDraftUpdate = Partial<FlatAgentChatThread> & {
  id: string;
};

export const useApplyAgentChatThreadUpdate = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const applyAgentChatThreadUpdate = (update: AgentChatThreadDraftUpdate) => {
    // updateInDraft merges partial entities by id while keeping a full-entity API.
    // seems like a upstream code smell -- because I see similar pattern in other places.
    // https://github.com/ehconitin/twenty/blob/feat/ai-chat-thread-actions/packages/twenty-front/src/modules/navigation-menu-item/edit/side-panel/components/SidePanelEditColorOption.tsx#L54-L55
    // https://github.com/ehconitin/twenty/blob/feat/ai-chat-thread-actions/packages/twenty-front/src/modules/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems.ts#L32
    updateInDraft('agentChatThreads', [update as FlatAgentChatThread]);
    applyChanges();
  };

  return { applyAgentChatThreadUpdate };
};
