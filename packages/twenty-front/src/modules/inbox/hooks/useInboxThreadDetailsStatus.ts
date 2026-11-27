import { AI_CHAT_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS } from '@/inbox/constants/AiChatThreadStatusActionByTriageStatus';
import { useInboxThreadTriage } from '@/inbox/hooks/useInboxThreadTriage';
import { useExecuteAiChatThreadStatusAction } from '@/ai-chat/threads/hooks/useExecuteAiChatThreadStatusAction';
import { aiChatChannelsState } from '@/ai-chat/threads/states/aiChatChannelsState';
import { aiChatChannelFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatChannelFamilySelector';
import { aiChatThreadPermissionsFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadPermissionsFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadTriageStatus } from '@/inbox/types/AiChatThreadTriageStatus';
import { getAiChatThreadChannelIdOutsideInbox } from '@/inbox/utils/getAiChatThreadChannelIdOutsideInbox';
import { getAiChatThreadDetailsStatusAccess } from '@/inbox/utils/getAiChatThreadDetailsStatusAccess';
import { getAiChatThreadStatusScope } from '@/inbox/utils/getAiChatThreadStatusScope';
import { isAiChatThreadStatusChangeNoOp } from '@/inbox/utils/isAiChatThreadStatusChangeNoOp';
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
  const aiChatChannel = useAtomFamilySelectorValue(
    aiChatChannelFamilySelector,
    channelId,
  );
  const scope = getAiChatThreadStatusScope({
    isInChannel,
    channel: aiChatChannel,
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
