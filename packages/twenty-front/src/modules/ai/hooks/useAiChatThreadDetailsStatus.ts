import { INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/inbox/constants/InboxThreadStatusActionByTriageStatus';
import { useInboxThreadTriage } from '@/inbox/hooks/useInboxThreadTriage';
import { useExecuteInboxThreadStatusAction } from '@/inbox/hooks/useExecuteInboxThreadStatusAction';
import { inboxChannelsState } from '@/inbox/states/inboxChannelsState';
import { aiChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/aiChatThreadPermissionsFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { type InboxThreadTriageStatus } from '@/inbox/types/InboxThreadTriageStatus';
import { getInboxThreadChannelIdOutsideInbox } from '@/inbox/utils/getInboxThreadChannelIdOutsideInbox';
import { getAiChatThreadDetailsStatusAccess } from '@/ai/utils/getAiChatThreadDetailsStatusAccess';
import { getAiChatThreadStatusScope } from '@/ai/utils/getAiChatThreadStatusScope';
import { isAiChatThreadStatusChangeNoOp } from '@/ai/utils/isAiChatThreadStatusChangeNoOp';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatThreadDetailsStatus = (threadId: string) => {
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );
  const permissions = useAtomFamilySelectorValue(
    aiChatThreadPermissionsFamilySelector,
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
  const scope = getAiChatThreadStatusScope({
    isInChannel,
    channel: inboxChannels?.find(({ id }) => id === channelId),
  });
  const { status, canChangeStatus } = getAiChatThreadDetailsStatusAccess({
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
      isAiChatThreadStatusChangeNoOp({ currentStatus: status, nextStatus })
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
