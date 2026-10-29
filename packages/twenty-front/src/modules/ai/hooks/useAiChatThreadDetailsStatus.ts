import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatThreadInboxStatusByThreadIdFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusByThreadIdFamilySelector';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AiChatThreadStatusScope } from '@/ai/types/AiChatThreadStatusScope';
import { getAiChatThreadTriageStatus } from '@/ai/utils/getAiChatThreadTriageStatus';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  AgentChatInboxAction,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

const INBOX_ACTION_BY_STATUS = {
  open: AgentChatInboxAction.MOVE_TO_INBOX,
  snoozed: AgentChatInboxAction.SNOOZE,
  done: AgentChatInboxAction.ARCHIVE,
};

export const useAiChatThreadDetailsStatus = (threadId: string) => {
  const { pathname } = useLocation();
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId,
  );
  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    threadId,
  );
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const channelId = isAiChatInboxPath(pathname)
    ? agentChatShownChannelView?.channelId
    : thread?.channelId;
  const channel = agentChatChannels?.find(({ id }) => id === channelId);
  const { [threadId]: inboxStatus } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusByThreadIdFamilySelector,
    { threadIds: [threadId], channelId },
  );
  const isInChannel = inboxStatus?.isChannelCopy ?? false;
  const scope: AiChatThreadStatusScope | undefined = isInChannel
    ? isDefined(channel)
      ? {
          type: 'channel',
          channelId: channel.id,
          channelName: channel.name,
        }
      : undefined
    : { type: 'personal' };
  const isThreadAvailable =
    isDefined(thread) &&
    !isDefined(thread.deletedAt) &&
    (permissions?.canRead ?? false);
  const status = isThreadAvailable
    ? getAiChatThreadTriageStatus({
        hasAiPermission,
        isInboxEnabled,
        areParticipantsLoaded:
          isInChannel || isDefined(agentChatThreadParticipants),
        scope: inboxStatus?.scope ?? 'NONE',
      })
    : undefined;
  const canChangeStatus =
    isDefined(status) &&
    isDefined(scope) &&
    (!isInChannel || (permissions?.canUpdate ?? false));
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  const changeStatus = (nextStatus: keyof typeof INBOX_ACTION_BY_STATUS) => {
    if (!canChangeStatus) {
      return;
    }

    void executeAgentChatThreadInboxAction({
      threadIds: [threadId],
      action: INBOX_ACTION_BY_STATUS[nextStatus],
      isInChannel,
    });
  };

  return { status, scope, canChangeStatus, isPending, changeStatus };
};
