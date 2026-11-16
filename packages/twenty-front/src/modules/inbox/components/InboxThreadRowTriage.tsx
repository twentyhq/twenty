import { isDefined } from 'twenty-shared/utils';

import { InboxThreadTriageButtons } from '@/inbox/components/InboxThreadTriageButtons';
import { AI_CHAT_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/AiChatThreadStatusActionByTriageStatus';
import { useInboxThreadTriage } from '@/inbox/hooks/useInboxThreadTriage';
import { useExecuteAiChatThreadStatusAction } from '@/ai/hooks/useExecuteAiChatThreadStatusAction';
import { type AiChatThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';

type InboxThreadRowTriageProps = {
  threadId: string;
};

export const InboxThreadRowTriage = ({
  threadId,
}: InboxThreadRowTriageProps) => {
  const { status, isInChannel } = useInboxThreadTriage({ threadId });
  const { executeAiChatThreadStatusAction, isPending } =
    useExecuteAiChatThreadStatusAction();

  if (!isDefined(status)) {
    return null;
  }

  const moveToStatus = (nextStatus: AiChatThreadTriageStatus) => {
    void executeAiChatThreadStatusAction({
      threadIds: [threadId],
      action: AI_CHAT_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS[nextStatus],
      isInChannel,
    });
  };

  return (
    <InboxThreadTriageButtons
      status={status}
      isPending={isPending}
      onSnooze={() => moveToStatus('snoozed')}
      onDone={() => moveToStatus('done')}
      onReopen={() => moveToStatus('open')}
    />
  );
};
