import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { inboxDraftPreviewTextFamilySelector } from '@/ai/states/selectors/inboxDraftPreviewTextFamilySelector';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { getInboxThreadSubtitleContent } from '@/ai/utils/getInboxThreadSubtitleContent';
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
