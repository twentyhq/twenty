import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { type AgentChatInboxAction } from '~/generated-metadata/graphql';

type AgentChatThreadInboxCommandProps = {
  action: AgentChatInboxAction | 'assign';
};

export const AgentChatThreadInboxCommand = ({
  action,
}: AgentChatThreadInboxCommandProps) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { executeAgentChatThreadInboxAction } =
    useExecuteAgentChatThreadInboxAction();

  const handleExecute = () =>
    executeAgentChatThreadInboxAction({
      threadIds: selectedRecords.map(({ id }) => id),
      action,
      isInChannel: selectedRecords.every(
        (record) => record.inboxStatus?.isChannelCopy ?? false,
      ),
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
