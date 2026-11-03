import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

export const getAgentChatThreadChannelStatus = ({
  lastActivityAt,
  channelArchivedAt,
  channelSnoozedUntil,
}: Pick<
  AgentChatThreadRecord,
  'lastActivityAt' | 'channelArchivedAt' | 'channelSnoozedUntil'
>): AgentChatChannelThreadStatus => {
  if (!isDefined(channelArchivedAt)) {
    return AgentChatChannelThreadStatus.OPEN;
  }

  if (isDefined(channelSnoozedUntil)) {
    return AgentChatChannelThreadStatus.SNOOZED;
  }

  return isDefined(lastActivityAt) && isAfter(lastActivityAt, channelArchivedAt)
    ? AgentChatChannelThreadStatus.OPEN
    : AgentChatChannelThreadStatus.DONE;
};
