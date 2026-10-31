import { isDefined } from 'twenty-shared/utils';
import {
  MessageChannelType,
  type TimelineThreadChannel,
} from '~/generated/graphql';

export const isChatTimelineThreadChannel = (
  channel: Pick<TimelineThreadChannel, 'type'> | null | undefined,
) =>
  isDefined(channel) &&
  (channel.type === MessageChannelType.APP ||
    channel.type === MessageChannelType.SMS);
