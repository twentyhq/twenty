import { isDefined } from 'twenty-shared/utils';
import { type TimelineThreadChannel } from '~/generated/graphql';

export const isChatTimelineThreadChannel = (
  channel: Pick<TimelineThreadChannel, 'conversationStyle'> | null | undefined,
) => isDefined(channel) && channel.conversationStyle === 'chat';
