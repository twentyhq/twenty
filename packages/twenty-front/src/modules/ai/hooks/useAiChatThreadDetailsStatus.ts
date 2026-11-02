import { AI_CHAT_THREAD_INBOX_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/AiChatThreadInboxActionByTriageStatus';
import { useAiChatThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AiChatThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';
import { getAiChatThreadChannelIdOutsideInbox } from '@/ai/utils/getAiChatThreadChannelIdOutsideInbox';
import { getAiChatThreadDetailsStatusAccess } from '@/ai/utils/getAiChatThreadDetailsStatusAccess';
import { getAiChatThreadStatusScope } from '@/ai/utils/getAiChatThreadStatusScope';
import { isAiChatThreadStatusChangeNoOp } from '@/ai/utils/isAiChatThreadStatusChangeNoOp';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatThreadDetailsStatus = (threadId: string) => {
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId,
  );
  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    threadId,
  );
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const {
    status: triageStatus,
    isInChannel,
    channelId,
  } = useAiChatThreadTriage({
    threadId,
    channelIdOutsideInbox: getAiChatThreadChannelIdOutsideInbox({
      threadChannelId: thread?.channelId,
      channels: agentChatChannels,
    }),
  });
  const scope = getAiChatThreadStatusScope({
    isInChannel,
    channel: agentChatChannels?.find(({ id }) => id === channelId),
  });
  const { status, canChangeStatus } = getAiChatThreadDetailsStatusAccess({
    thread,
    permissions,
    triageStatus,
    scope,
    isInChannel,
  });
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  const changeStatus = (nextStatus: AiChatThreadTriageStatus) => {
    if (
      !canChangeStatus ||
      isAiChatThreadStatusChangeNoOp({ currentStatus: status, nextStatus })
    ) {
      return;
    }

    void executeAgentChatThreadInboxAction({
      threadIds: [threadId],
      action: AI_CHAT_THREAD_INBOX_ACTION_BY_TRIAGE_STATUS[nextStatus],
      isInChannel,
    });
  };

  return { status, scope, canChangeStatus, isPending, changeStatus };
};
