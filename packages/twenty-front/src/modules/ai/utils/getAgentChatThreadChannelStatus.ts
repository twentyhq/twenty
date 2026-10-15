import { isAfter } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

// The channel's copy of a chat's triage, shared by its members. Activity
// after it was filed reopens it, as for a member's own copy
export const getAgentChatThreadChannelStatus = ({
  lastActivityAt,
  channelArchivedAt,
  channelSnoozedUntil,
}: Pick<
  AgentChatThreadRecord,
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
