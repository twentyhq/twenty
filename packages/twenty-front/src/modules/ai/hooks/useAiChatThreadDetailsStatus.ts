import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_THREAD_INBOX_ACTION_BY_TRIAGE_STATUS } from '@/ai/constants/AiChatThreadInboxActionByTriageStatus';
import { useAiChatThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AiChatThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';
import { getAiChatThreadStatusScope } from '@/ai/utils/getAiChatThreadStatusScope';
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
  const isThreadChannelInaccessible =
    isDefined(agentChatChannels) &&
    !agentChatChannels.some(
      ({ id, isAccessible }) => isAccessible && id === thread?.channelId,
    );
  const {
    status: triageStatus,
    isInChannel,
    channelId,
  } = useAiChatThreadTriage(threadId, {
    channelIdOutsideInbox: isThreadChannelInaccessible
      ? null
      : thread?.channelId,
  });
  const scope = getAiChatThreadStatusScope({
    isInChannel,
    channel: agentChatChannels?.find(({ id }) => id === channelId),
  });
  const isThreadAvailable =
    isDefined(thread) &&
    !isDefined(thread.deletedAt) &&
    (permissions?.canRead ?? false);
  const status = isThreadAvailable ? triageStatus : undefined;
  const canChangeStatus =
    isDefined(status) &&
    isDefined(scope) &&
    (!isInChannel || (permissions?.canUpdate ?? false));
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  const changeStatus = (nextStatus: AiChatThreadTriageStatus) => {
    const isNoOpStatusChange =
      nextStatus === status && nextStatus !== 'snoozed';

    if (!canChangeStatus || isNoOpStatusChange) {
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
