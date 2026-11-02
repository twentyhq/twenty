import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadTriageButtons } from '@/ai/components/AiChatThreadTriageButtons';
import { AI_CHAT_THREAD_INBOX_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/AiChatThreadInboxActionByTriageStatus';
import { useAiChatThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { type AiChatThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';

type AiChatThreadRowTriageProps = {
  threadId: string;
};

export const AiChatThreadRowTriage = ({
  threadId,
}: AiChatThreadRowTriageProps) => {
  const { status, isInChannel } = useAiChatThreadTriage({ threadId });
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  if (!isDefined(status)) {
    return null;
  }

  const moveToStatus = (nextStatus: AiChatThreadTriageStatus) => {
    void executeAgentChatThreadInboxAction({
      threadIds: [threadId],
      action: AI_CHAT_THREAD_INBOX_ACTION_BY_TRIAGE_STATUS[nextStatus],
      isInChannel,
    });
  };

  return (
    <AiChatThreadTriageButtons
      status={status}
      isPending={isPending}
      onSnooze={() => moveToStatus('snoozed')}
      onDone={() => moveToStatus('done')}
      onReopen={() => moveToStatus('open')}
    />
  );
};
