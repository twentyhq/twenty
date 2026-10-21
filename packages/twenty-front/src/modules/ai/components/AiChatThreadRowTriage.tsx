import { isDefined } from 'twenty-shared/utils';
import { useState } from 'react';

import { AiChatThreadTriageButtons } from '@/ai/components/AiChatThreadTriageButtons';
import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  AgentChatInboxAction,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  const [isPending, setIsPending] = useState(false);
  const { scope } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    threadId,
  );
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();

  if (
    !hasAiPermission ||
    !isInboxEnabled ||
    !isDefined(agentChatThreadParticipants) ||
    scope === 'NONE'
  ) {
    return null;
  }

  const updateInboxState = async (action: AgentChatInboxAction) => {
    setIsPending(true);

    try {
      await updateAgentChatThreadInboxState({ threadIds: [threadId], action });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AiChatThreadTriageButtons
      status={
        scope === 'ARCHIVED' ? 'done' : scope === 'SNOOZED' ? 'snoozed' : 'open'
      }
      isPending={isPending}
      onSnooze={() => openSnoozeAiChatInSidePanel([threadId])}
      onDone={() => {
        void updateInboxState(AgentChatInboxAction.ARCHIVE);
      }}
      onReopen={() => {
        void updateInboxState(AgentChatInboxAction.MOVE_TO_INBOX);
      }}
    />
  );
};
