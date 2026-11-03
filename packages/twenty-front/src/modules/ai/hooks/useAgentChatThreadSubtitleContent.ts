import { useAgentChatThreadRowMetadata } from '@/ai/hooks/useAgentChatThreadRowMetadata';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatDraftPreviewTextFamilySelector } from '@/ai/states/selectors/agentChatDraftPreviewTextFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadSubtitleContent } from '@/ai/utils/getAgentChatThreadSubtitleContent';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatThreadSubtitleContent = (
  thread: AgentChatThreadRecord,
) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const draftPreviewText = useAtomFamilySelectorValue(
    agentChatDraftPreviewTextFamilySelector,
    thread.id,
  );

  const rowMetadata = useAgentChatThreadRowMetadata(thread);
  const participants = useAtomStateValue(agentChatThreadParticipantsState);

  return getAgentChatThreadSubtitleContent({
    rowMetadata,
    participant: participants?.[thread.id],
    thread,
    draftPreviewText,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
};
