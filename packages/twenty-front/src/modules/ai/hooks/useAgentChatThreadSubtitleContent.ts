import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { inboxDraftPreviewTextFamilySelector } from '@/ai/states/selectors/agentChatDraftPreviewTextFamilySelector';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getInboxThreadSubtitleContent } from '@/ai/utils/getAgentChatThreadSubtitleContent';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxThreadSubtitleContent = (thread: InboxThreadRecord) => {
  const { displayName: assistantDisplayName } = useAiChatAssistantProfile();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const draftPreviewText = useAtomFamilySelectorValue(
    inboxDraftPreviewTextFamilySelector,
    thread.id,
  );

  return getInboxThreadSubtitleContent({
    thread,
    draftPreviewText,
    assistantDisplayName,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
};
