import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useChatThreadParticipants } from '@/ai/hooks/useChatThreadParticipants';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatChannelMember } from '@/metadata-store/types/FlatAgentChatChannelMember';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatThreadAssignee = (threadId: string | null) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { participants } = useChatThreadParticipants(threadId);
  const threadsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );
  const channelMembersStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatChannelMembers'),
  );

  const thread = (threadsStoreEntry.current as FlatAgentChatThread[]).find(
    (candidate) => candidate.id === threadId,
  );

  const channelMemberUserWorkspaceIds = isDefined(thread?.channelId)
    ? (channelMembersStoreEntry.current as FlatAgentChatChannelMember[])
        .filter((member) => member.channelId === thread.channelId)
        .map((member) => member.userWorkspaceId)
    : [];

  // Whoever can open the thread can be handed it. A channel's role holders
  // are not in the store, so they are missing from the list rather than
  // wrongly offered: the server refuses an assignee who cannot read anyway.
  const candidateUserWorkspaceIds = [
    ...new Set([
      ...participants.map((participant) => participant.userWorkspaceId),
      ...channelMemberUserWorkspaceIds,
    ]),
  ];

  const assignableWorkspaceMembers = candidateUserWorkspaceIds.flatMap(
    (userWorkspaceId) => {
      const workspaceMember = currentWorkspaceMembers.find(
        (member) => member.userWorkspaceId === userWorkspaceId,
      );

      return isDefined(workspaceMember) ? [workspaceMember] : [];
    },
  );

  const assigneeWorkspaceMember = isDefined(thread?.assigneeUserWorkspaceId)
    ? currentWorkspaceMembers.find(
        (member) => member.userWorkspaceId === thread.assigneeUserWorkspaceId,
      )
    : undefined;

  return { assignableWorkspaceMembers, assigneeWorkspaceMember, thread };
};
