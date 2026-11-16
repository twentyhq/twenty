import { useExecuteAiChatThreadStatusAction } from '@/ai/hooks/useExecuteAiChatThreadStatusAction';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useInboxThreadMemberStateByThreadId } from '@/inbox/hooks/useInboxThreadMemberStateByThreadId';
import { type AgentChatInboxAction } from '~/generated-metadata/graphql';

type InboxThreadInboxCommandProps = {
  action: AgentChatInboxAction | 'assign';
};

export const InboxThreadInboxCommand = ({
  action,
}: InboxThreadInboxCommandProps) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const threadIds = selectedRecords.map(({ id }) => id);
  const { inboxThreadMemberStateByThreadId } =
    useInboxThreadMemberStateByThreadId({ threadIds });
  const { executeAiChatThreadStatusAction } =
    useExecuteAiChatThreadStatusAction();

  const handleExecute = () =>
    executeAiChatThreadStatusAction({
      threadIds,
      action,
      isInChannel: threadIds.every(
        (threadId) =>
          inboxThreadMemberStateByThreadId[threadId]?.isChannelCopy ?? false,
      ),
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
