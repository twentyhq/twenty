import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadTriageButtons } from '@/ai/components/AiChatThreadTriageButtons';
import { useAiChatThreadTriageStatus } from '@/ai/hooks/useAiChatThreadTriageStatus';
import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

type AiChatThreadRowTriageProps = {
  threadId: string;
};

export const AiChatThreadRowTriage = ({
  threadId,
}: AiChatThreadRowTriageProps) => {
  const status = useAiChatThreadTriageStatus(threadId);
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  if (!isDefined(status)) {
    return null;
  }

  const executeInboxAction = (action: AgentChatInboxAction) => {
    void executeAgentChatThreadInboxAction({ threadIds: [threadId], action });
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
