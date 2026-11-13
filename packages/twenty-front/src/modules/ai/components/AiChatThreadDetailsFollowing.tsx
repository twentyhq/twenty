import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadFollowersField } from '@/ai/components/AiChatThreadFollowersField';
import { useExecuteInboxThreadStatusAction } from '@/ai/hooks/useExecuteInboxThreadStatusAction';
import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/inboxThreadMemberStateFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
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
    aiChatThreadRecordFamilySelector,
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
