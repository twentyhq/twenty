import { AI_CHAT_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/ai-chat/threads/constants/AiChatThreadStatusActionByTriageStatus';
import { useInboxThreadTriage } from '@/inbox/hooks/useInboxThreadTriage';
import { useExecuteAiChatThreadStatusAction } from '@/ai-chat/threads/hooks/useExecuteAiChatThreadStatusAction';
import { aiChatChannelsState } from '@/ai-chat/threads/states/aiChatChannelsState';
import { aiChatThreadPermissionsFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadPermissionsFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadTriageStatus } from '@/ai-chat/threads/types/AiChatThreadTriageStatus';
import { getAiChatThreadChannelIdOutsideInbox } from '@/ai-chat/threads/utils/getAiChatThreadChannelIdOutsideInbox';
import { getAiChatThreadDetailsStatusAccess } from '@/ai-chat/threads/utils/getAiChatThreadDetailsStatusAccess';
import { getAiChatThreadStatusScope } from '@/ai-chat/threads/utils/getAiChatThreadStatusScope';
import { isAiChatThreadStatusChangeNoOp } from '@/ai-chat/threads/utils/isAiChatThreadStatusChangeNoOp';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxThreadDetailsStatus = (threadId: string) => {
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
