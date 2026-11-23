import { isDefined } from 'twenty-shared/utils';
import {
  MessageChannelType,
  type TimelineThreadChannel,
} from '~/generated/graphql';

export const isChatTimelineThreadChannel = (
  channel:
    | Pick<TimelineThreadChannel, 'type' | 'conversationStyle'>
    | null
    | undefined,
) => {
  if (!isDefined(channel)) {
    return false;
  }

  if (isDefined(channel.conversationStyle)) {
    return channel.conversationStyle === 'chat';
  }

  return channel.type === MessageChannelType.APP;
};
