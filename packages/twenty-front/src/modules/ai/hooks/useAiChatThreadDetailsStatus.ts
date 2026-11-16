import { AI_CHAT_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/AiChatThreadStatusActionByTriageStatus';
import { useInboxThreadTriage } from '@/inbox/hooks/useInboxThreadTriage';
import { useExecuteAiChatThreadStatusAction } from '@/ai/hooks/useExecuteAiChatThreadStatusAction';
import { aiChatChannelsState } from '@/ai/states/aiChatChannelsState';
import { aiChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/aiChatThreadPermissionsFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';
import { getAiChatThreadChannelIdOutsideInbox } from '@/ai/utils/getAiChatThreadChannelIdOutsideInbox';
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
  const aiChatChannels = useAtomStateValue(aiChatChannelsState);
  const {
    status: triageStatus,
    isInChannel,
    channelId,
  } = useInboxThreadTriage({
    threadId,
    channelIdOutsideInbox: getAiChatThreadChannelIdOutsideInbox({
      threadChannelId: thread?.channelId,
      channels: aiChatChannels,
    }),
  });
  const scope = getAiChatThreadStatusScope({
    isInChannel,
    channel: aiChatChannels?.find(({ id }) => id === channelId),
  });
  const { status, canChangeStatus } = getAiChatThreadDetailsStatusAccess({
    thread,
    permissions,
    triageStatus,
    scope,
    isInChannel,
  });
  const { executeAiChatThreadStatusAction, isPending } =
    useExecuteAiChatThreadStatusAction();

  const changeStatus = (nextStatus: AiChatThreadTriageStatus) => {
    if (
      !canChangeStatus ||
      isAiChatThreadStatusChangeNoOp({ currentStatus: status, nextStatus })
    ) {
      return;
    }

    void executeAiChatThreadStatusAction({
      threadIds: [threadId],
      action: AI_CHAT_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS[nextStatus],
      isInChannel,
    });
  };

  return { status, scope, canChangeStatus, isPending, changeStatus };
};
