import { isDefined } from 'twenty-shared/utils';

import { InboxThreadTriageButtons } from '@/inbox/components/InboxThreadTriageButtons';
import { INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/inbox/constants/InboxThreadStatusActionByTriageStatus';
import { useInboxThreadTriage } from '@/inbox/hooks/useInboxThreadTriage';
import { useExecuteInboxThreadStatusAction } from '@/inbox/hooks/useExecuteInboxThreadStatusAction';
import { type InboxThreadTriageStatus } from '@/inbox/types/InboxThreadTriageStatus';

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
