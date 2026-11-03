import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadRowMetadataFamilyState } from '@/ai/states/agentChatThreadRowMetadataFamilyState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAgentChatThreadRowMetadata = (
  thread: AgentChatThreadRecord,
) => {
  const agentChatThreadRowMetadata = useAtomFamilyStateValue(
    agentChatThreadRowMetadataFamilyState,
    thread.id,
  );
  const isCurrentMetadata =
    isDefined(agentChatThreadRowMetadata) &&
    agentChatThreadRowMetadata.activityAt === (thread.lastActivityAt ?? null) &&
    agentChatThreadRowMetadata.pendingQuestionMessageId ===
      (thread.pendingQuestionMessageId ?? null);

  return isCurrentMetadata ? agentChatThreadRowMetadata : null;
};
