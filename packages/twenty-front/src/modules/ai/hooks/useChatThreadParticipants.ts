import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadParticipantsComponentFamilyState } from '@/ai/states/agentChatThreadParticipantsComponentFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatThreadParticipantRole } from '~/generated-metadata/graphql';

export const useChatThreadParticipants = (threadId: string | null) => {
  const agentChatThreadParticipants = useAtomComponentFamilyStateValue(
    agentChatThreadParticipantsComponentFamilyState,
    { threadId },
  );
  const participants = agentChatThreadParticipants;
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const threadsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );
  const thread = (threadsStoreEntry.current as FlatAgentChatThread[]).find(
    (candidate) => candidate.id === threadId,
  );

  const participantsWithMember = participants.flatMap((participant) => {
    const workspaceMember = currentWorkspaceMembers.find(
      (member) => member.userWorkspaceId === participant.userWorkspaceId,
    );

    return isDefined(workspaceMember) ? [{ participant, workspaceMember }] : [];
  });

  const currentParticipant = participants.find(
    (participant) =>
      participant.userWorkspaceId === currentWorkspaceMember?.userWorkspaceId,
  );

  const isCurrentUserOwner =
    currentParticipant?.role === AgentChatThreadParticipantRole.OWNER;

  // A thread in a channel is readable by every channel member, so authors
  // matter even with a single participant row.
  const isSharedThread =
    participants.length > 1 || isDefined(thread?.channelId);

  return {
    participants,
    participantsWithMember,
    currentParticipant,
    isCurrentUserOwner,
    isSharedThread,
  };
};
