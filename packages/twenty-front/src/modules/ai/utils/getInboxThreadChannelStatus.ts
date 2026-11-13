import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

// Activity after the chat was filed reopens it, as for a member's own copy
export const getInboxThreadChannelStatus = ({
  lastActivityAt,
  channelArchivedAt,
  channelSnoozedUntil,
}: Pick<
  InboxThreadRecord,
  'lastActivityAt' | 'channelArchivedAt' | 'channelSnoozedUntil'
>): AgentChatChannelThreadStatus => {
  if (
    !isDefined(channelArchivedAt) ||
    (isDefined(lastActivityAt) && isAfter(lastActivityAt, channelArchivedAt))
  ) {
    return AgentChatChannelThreadStatus.OPEN;
  }

  return isDefined(channelSnoozedUntil)
    ? AgentChatChannelThreadStatus.SNOOZED
    : AgentChatChannelThreadStatus.DONE;
};
