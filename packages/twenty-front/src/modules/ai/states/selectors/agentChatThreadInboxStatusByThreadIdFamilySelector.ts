import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type AgentChatThreadInboxStatusByThreadIdFamilyKey = {
  threadIds: string[];
};

export const agentChatThreadInboxStatusByThreadIdFamilySelector =
  createAtomFamilySelector<
    Record<string, AgentChatThreadInboxStatus>,
    AgentChatThreadInboxStatusByThreadIdFamilyKey
  >({
    key: 'agentChatThreadInboxStatusByThreadIdFamilySelector',
    get:
      ({ threadIds }: AgentChatThreadInboxStatusByThreadIdFamilyKey) =>
      ({ get }) =>
        Object.fromEntries(
          threadIds.map((threadId) => [
            threadId,
            get(agentChatThreadInboxStatusFamilySelector, threadId),
          ]),
        ),
    areEqual: isDeeplyEqual,
  });
