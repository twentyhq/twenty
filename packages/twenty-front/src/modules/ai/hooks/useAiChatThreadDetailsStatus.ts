import { INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/AiChatThreadInboxActionByTriageStatus';
import { useInboxThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { useExecuteInboxThreadStatusAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { inboxChannelsState } from '@/ai/states/agentChatChannelsState';
import { inboxThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type InboxThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';
import { getInboxThreadChannelIdOutsideInbox } from '@/ai/utils/getAiChatThreadChannelIdOutsideInbox';
import { getInboxThreadDetailsStatusAccess } from '@/ai/utils/getAiChatThreadDetailsStatusAccess';
import { getInboxThreadStatusScope } from '@/ai/utils/getAiChatThreadStatusScope';
import { isInboxThreadStatusChangeNoOp } from '@/ai/utils/isAiChatThreadStatusChangeNoOp';
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
