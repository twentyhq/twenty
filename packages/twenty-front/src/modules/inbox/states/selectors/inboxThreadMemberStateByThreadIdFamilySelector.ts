import { isDefined } from 'twenty-shared/utils';
import { type AgentChatThreadInboxStatus } from 'twenty-shared/ai';

import { aiChatThreadMemberStateFamilySelector } from '@/ai/states/selectors/aiChatThreadMemberStateFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { getInboxThreadChannelStatus } from '@/inbox/utils/getInboxThreadChannelStatus';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type InboxThreadMemberStateByThreadIdFamilyKey = {
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

export const inboxThreadMemberStateByThreadIdFamilySelector =
  createAtomFamilySelector<
    Record<string, AgentChatThreadInboxStatus>,
    InboxThreadMemberStateByThreadIdFamilyKey
  >({
    key: 'inboxThreadMemberStateByThreadIdFamilySelector',
    get:
      ({ threadIds, channelId }: InboxThreadMemberStateByThreadIdFamilyKey) =>
      ({ get }) =>
        Object.fromEntries(
          threadIds.map((threadId) => {
            const inboxStatus = get(
              aiChatThreadMemberStateFamilySelector,
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
