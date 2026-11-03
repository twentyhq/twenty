import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadRowMetadataFamilyState } from '@/ai/states/agentChatThreadRowMetadataFamilyState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAgentChatThreadRowMetadata = (
  thread: AgentChatThreadRecord,
) => {
  const metadata = useAtomFamilyStateValue(
    agentChatThreadRowMetadataFamilyState,
    thread.id,
  );
  const isCurrentMetadata =
    isDefined(metadata) &&
    metadata.activityAt === (thread.lastActivityAt ?? null) &&
    metadata.pendingQuestionMessageId ===
      (thread.pendingQuestionMessageId ?? null);

  return isCurrentMetadata ? metadata : null;
};
