import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadFollowersField } from '@/ai/components/AiChatThreadFollowersField';
import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

type AiChatThreadDetailsFollowingProps = {
  threadId: string;
};

export const AiChatThreadDetailsFollowing = ({
  threadId,
}: AiChatThreadDetailsFollowingProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId,
  );
  const { isSubscribed, isAssignedToMe } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    threadId,
  );
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  const isAssigneeFollowing = isSubscribed && isAssignedToMe;
  const canChangeFollowing =
    !isDefined(thread?.deletedAt) && !isAssigneeFollowing;

  const handleFollowingChange = (isFollowing: boolean) =>
    executeAgentChatThreadInboxAction({
      threadIds: [threadId],
      action: isFollowing
        ? AgentChatInboxAction.SUBSCRIBE
        : AgentChatInboxAction.UNSUBSCRIBE,
      isInChannel: false,
    });

  return (
    <AiChatThreadFollowersField
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
