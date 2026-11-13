import { isDefined } from 'twenty-shared/utils';

import { InboxThreadFollowersField } from '@/ai/components/AiChatThreadFollowersField';
import { useExecuteInboxThreadStatusAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

type InboxThreadDetailsFollowingProps = {
  threadId: string;
};

export const InboxThreadDetailsFollowing = ({
  threadId,
}: InboxThreadDetailsFollowingProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const thread = useAtomFamilySelectorValue(
    inboxThreadRecordFamilySelector,
    threadId,
  );
  const { isSubscribed, isAssignedToMe } = useAtomFamilySelectorValue(
    inboxThreadMemberStateFamilySelector,
    threadId,
  );
  const { executeInboxThreadStatusAction, isPending } =
    useExecuteInboxThreadStatusAction();

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  const isAssigneeFollowing = isSubscribed && isAssignedToMe;
  const canChangeFollowing =
    !isDefined(thread?.deletedAt) && !isAssigneeFollowing;

  const handleFollowingChange = (isFollowing: boolean) =>
    executeInboxThreadStatusAction({
      threadIds: [threadId],
      action: isFollowing
        ? AgentChatInboxAction.SUBSCRIBE
        : AgentChatInboxAction.UNSUBSCRIBE,
      isInChannel: false,
    });

  return (
    <InboxThreadFollowersField
      followers={
        isSubscribed
          ? [
              {
                id: currentWorkspaceMember.id,
                name: getWorkspaceMemberNameOrEmail(currentWorkspaceMember),
                avatarUrl: currentWorkspaceMember.avatarUrl,
              },
            ]
          : []
      }
      isFollowing={isSubscribed}
      isSaving={isPending}
      onFollowingChange={canChangeFollowing ? handleFollowingChange : undefined}
    />
  );
};
