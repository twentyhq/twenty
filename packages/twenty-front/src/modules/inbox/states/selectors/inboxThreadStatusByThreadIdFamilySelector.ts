import { isDefined } from 'twenty-shared/utils';
import { type AgentChatThreadInboxStatus } from 'twenty-shared/ai';

import { aiChatThreadInboxStatusFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadInboxStatusFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { getInboxThreadChannelStatus } from '@/inbox/utils/getInboxThreadChannelStatus';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type InboxThreadInboxStatusByThreadIdFamilyKey = {
  threadIds: string[];
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

export const inboxThreadStatusByThreadIdFamilySelector =
  createAtomFamilySelector<
    Record<string, AgentChatThreadInboxStatus>,
    InboxThreadInboxStatusByThreadIdFamilyKey
  >({
    key: 'inboxThreadStatusByThreadIdFamilySelector',
    get:
      ({ threadIds, channelId }: InboxThreadInboxStatusByThreadIdFamilyKey) =>
      ({ get }) =>
        Object.fromEntries(
          threadIds.map((threadId) => {
            const inboxStatus = get(
              aiChatThreadInboxStatusFamilySelector,
              threadId,
            );
            const thread = get(aiChatThreadRecordFamilySelector, threadId);

            if (!isDefined(channelId) || thread?.channelId !== channelId) {
              return [threadId, inboxStatus];
            }

            return [
              threadId,
              {
                ...inboxStatus,
                scope:
                  CHANNEL_STATUS_SCOPES[getInboxThreadChannelStatus(thread)],
                isChannelCopy: true,
              },
            ];
          }),
        ),
    areEqual: isDeeplyEqual,
  });
