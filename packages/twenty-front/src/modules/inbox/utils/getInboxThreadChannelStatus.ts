import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

export const getInboxThreadChannelStatus = ({
  lastActivityAt,
  channelArchivedAt,
  channelSnoozedUntil,
}: Pick<
  AiChatThreadRecord,
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
