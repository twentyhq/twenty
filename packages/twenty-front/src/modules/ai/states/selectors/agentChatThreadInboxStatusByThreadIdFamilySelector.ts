import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { getAgentChatThreadChannelStatus } from '@/ai/utils/getAgentChatThreadChannelStatus';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type AgentChatThreadInboxStatusByThreadIdFamilyKey = {
  threadIds: string[];
  // Chats of the channel on screen are filed for the whole channel
  channelId?: string | null;
};

const CHANNEL_STATUS_SCOPES: Record<
  AgentChatChannelThreadStatus,
  AgentChatThreadInboxStatus['scope']
> = {
  [AgentChatChannelThreadStatus.OPEN]: 'INBOX',
  [AgentChatChannelThreadStatus.SNOOZED]: 'SNOOZED',
  [AgentChatChannelThreadStatus.DONE]: 'ARCHIVED',
};

export const agentChatThreadInboxStatusByThreadIdFamilySelector =
  createAtomFamilySelector<
    Record<string, AgentChatThreadInboxStatus>,
    AgentChatThreadInboxStatusByThreadIdFamilyKey
  >({
    key: 'agentChatThreadInboxStatusByThreadIdFamilySelector',
    get:
      ({
        threadIds,
        channelId,
      }: AgentChatThreadInboxStatusByThreadIdFamilyKey) =>
      ({ get }) =>
        Object.fromEntries(
          threadIds.map((threadId) => {
            const inboxStatus = get(
              agentChatThreadInboxStatusFamilySelector,
              threadId,
            );
            const thread = get(agentChatThreadRecordFamilySelector, threadId);

            if (!isDefined(channelId) || thread?.channelId !== channelId) {
              return [threadId, inboxStatus];
            }

            return [
              threadId,
              {
                ...inboxStatus,
                scope:
                  CHANNEL_STATUS_SCOPES[
                    getAgentChatThreadChannelStatus(thread)
                  ],
                isChannelCopy: true,
              },
            ];
          }),
        ),
    areEqual: isDeeplyEqual,
  });
