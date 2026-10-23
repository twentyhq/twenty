import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadTriageButtons } from '@/ai/components/AiChatThreadTriageButtons';
import { useAiChatThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

type AiChatThreadRowTriageProps = {
  threadId: string;
};

export const AiChatThreadRowTriage = ({
  threadId,
}: AiChatThreadRowTriageProps) => {
  const { status, isInChannel } = useAiChatThreadTriage(threadId);
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  if (!isDefined(status)) {
    return null;
  }

  const executeInboxAction = (action: AgentChatInboxAction) => {
    void executeAgentChatThreadInboxAction({
      threadIds: [threadId],
      action,
      isInChannel,
    });
  };

  return (
    <AiChatThreadTriageButtons
      status={status}
      isPending={isPending}
      onSnooze={() => executeInboxAction(AgentChatInboxAction.SNOOZE)}
      onDone={() => executeInboxAction(AgentChatInboxAction.ARCHIVE)}
      onReopen={() => executeInboxAction(AgentChatInboxAction.MOVE_TO_INBOX)}
    />
  );
};
