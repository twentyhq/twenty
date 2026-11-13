import { isDefined } from 'twenty-shared/utils';

import { InboxThreadTriageButtons } from '@/ai/components/AiChatThreadTriageButtons';
import { INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/AiChatThreadInboxActionByTriageStatus';
import { useInboxThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { useExecuteInboxThreadStatusAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { type InboxThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';

type InboxThreadRowTriageProps = {
  threadId: string;
};

export const InboxThreadRowTriage = ({
  threadId,
}: InboxThreadRowTriageProps) => {
  const { status, isInChannel } = useInboxThreadTriage({ threadId });
  const { executeInboxThreadStatusAction, isPending } =
    useExecuteInboxThreadStatusAction();

  if (!isDefined(status)) {
    return null;
  }

  const moveToStatus = (nextStatus: InboxThreadTriageStatus) => {
    void executeInboxThreadStatusAction({
      threadIds: [threadId],
      action: INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS[nextStatus],
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
