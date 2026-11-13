import { INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/InboxThreadStatusActionByTriageStatus';
import { useInboxThreadTriage } from '@/ai/hooks/useInboxThreadTriage';
import { useExecuteInboxThreadStatusAction } from '@/ai/hooks/useExecuteInboxThreadStatusAction';
import { inboxChannelsState } from '@/ai/states/inboxChannelsState';
import { inboxThreadPermissionsFamilySelector } from '@/ai/states/selectors/inboxThreadPermissionsFamilySelector';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { type InboxThreadTriageStatus } from '@/ai/types/InboxThreadTriageStatus';
import { getInboxThreadChannelIdOutsideInbox } from '@/ai/utils/getInboxThreadChannelIdOutsideInbox';
import { getInboxThreadDetailsStatusAccess } from '@/ai/utils/getInboxThreadDetailsStatusAccess';
import { getInboxThreadStatusScope } from '@/ai/utils/getInboxThreadStatusScope';
import { isInboxThreadStatusChangeNoOp } from '@/ai/utils/isInboxThreadStatusChangeNoOp';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxThreadDetailsStatus = (threadId: string) => {
  const thread = useAtomFamilySelectorValue(
    inboxThreadRecordFamilySelector,
    threadId,
  );
  const permissions = useAtomFamilySelectorValue(
    inboxThreadPermissionsFamilySelector,
    threadId,
  );
  const inboxChannels = useAtomStateValue(inboxChannelsState);
  const {
    status: triageStatus,
    isInChannel,
    channelId,
  } = useInboxThreadTriage({
    threadId,
    channelIdOutsideInbox: getInboxThreadChannelIdOutsideInbox({
      threadChannelId: thread?.channelId,
      channels: inboxChannels,
    }),
  });
  const scope = getInboxThreadStatusScope({
    isInChannel,
    channel: inboxChannels?.find(({ id }) => id === channelId),
  });
  const { status, canChangeStatus } = getInboxThreadDetailsStatusAccess({
    thread,
    permissions,
    triageStatus,
    scope,
    isInChannel,
  });
  const { executeInboxThreadStatusAction, isPending } =
    useExecuteInboxThreadStatusAction();

  const changeStatus = (nextStatus: InboxThreadTriageStatus) => {
    if (
      !canChangeStatus ||
      isInboxThreadStatusChangeNoOp({ currentStatus: status, nextStatus })
    ) {
      return;
    }

    void executeInboxThreadStatusAction({
      threadIds: [threadId],
      action: INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS[nextStatus],
      isInChannel,
    });
  };

  return { status, scope, canChangeStatus, isPending, changeStatus };
};
