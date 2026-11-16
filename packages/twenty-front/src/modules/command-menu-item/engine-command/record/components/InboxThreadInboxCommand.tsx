import { useExecuteAiChatThreadStatusAction } from '@/ai/hooks/useExecuteAiChatThreadStatusAction';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { type AgentChatInboxAction } from '~/generated-metadata/graphql';

type InboxThreadInboxCommandProps = {
  action: AgentChatInboxAction | 'assign';
};

export const InboxThreadInboxCommand = ({
  action,
}: InboxThreadInboxCommandProps) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { executeAiChatThreadStatusAction } =
    useExecuteAiChatThreadStatusAction();

  const handleExecute = () =>
    executeAiChatThreadStatusAction({
      threadIds: selectedRecords.map(({ id }) => id),
      action,
      isInChannel: selectedRecords.every(
        (record) => record.inboxStatus?.isChannelCopy ?? false,
      ),
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
