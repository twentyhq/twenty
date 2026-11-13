import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { aiChatDraftPreviewTextFamilySelector } from '@/ai/states/selectors/aiChatDraftPreviewTextFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getAiChatThreadSubtitleContent } from '@/ai/utils/getAiChatThreadSubtitleContent';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatThreadSubtitleContent = (thread: AiChatThreadRecord) => {
  const { displayName: assistantDisplayName } = useAiChatAssistantProfile();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const draftPreviewText = useAtomFamilySelectorValue(
    aiChatDraftPreviewTextFamilySelector,
    thread.id,
  );

  return getAiChatThreadSubtitleContent({
    thread,
    draftPreviewText,
    assistantDisplayName,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
};
