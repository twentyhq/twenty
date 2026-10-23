import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadTriageButtons } from '@/ai/components/AiChatThreadTriageButtons';
import { useExecuteAgentChatThreadInboxAction } from '@/ai/hooks/useExecuteAgentChatThreadInboxAction';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatThreadInboxStatusByThreadIdFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusByThreadIdFamilySelector';
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

const TRIAGE_STATUS_BY_SCOPE = {
  INBOX: 'open',
  SNOOZED: 'snoozed',
  ARCHIVED: 'done',
} as const;

type AiChatThreadRowTriageProps = {
  threadId: string;
};

export const AiChatThreadRowTriage = ({
  threadId,
}: AiChatThreadRowTriageProps) => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const location = useLocation();
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const { [threadId]: inboxStatus } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusByThreadIdFamilySelector,
    {
      threadIds: [threadId],
      channelId: isAiChatInboxPath(location.pathname)
        ? (agentChatShownChannelView?.channelId ?? null)
        : null,
    },
  );
  const { executeAgentChatThreadInboxAction, isPending } =
    useExecuteAgentChatThreadInboxAction();

  if (
    !hasAiPermission ||
    !isInboxEnabled ||
    !isDefined(agentChatThreadParticipants) ||
    !isDefined(inboxStatus) ||
    inboxStatus.scope === 'NONE'
  ) {
    return null;
  }

  const executeInboxAction = (action: AgentChatInboxAction) => {
    void executeAgentChatThreadInboxAction({
      threadIds: [threadId],
      action,
      isInChannel: inboxStatus.isChannelCopy,
    });
  };

  return (
    <AiChatThreadTriageButtons
      status={TRIAGE_STATUS_BY_SCOPE[inboxStatus.scope]}
      isPending={isPending}
      onSnooze={() => executeInboxAction(AgentChatInboxAction.SNOOZE)}
      onDone={() => executeInboxAction(AgentChatInboxAction.ARCHIVE)}
      onReopen={() => executeInboxAction(AgentChatInboxAction.MOVE_TO_INBOX)}
    />
  );
};
