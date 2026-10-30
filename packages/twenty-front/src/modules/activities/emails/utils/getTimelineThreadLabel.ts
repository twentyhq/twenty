import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';
import {
  MessageChannelVisibility,
  type TimelineThread,
} from '~/generated/graphql';

export const getTimelineThreadLabel = (
  thread: Pick<TimelineThread, 'subject' | 'visibility' | 'channel'>,
) => {
  const isSubjectVisible =
    thread.visibility === MessageChannelVisibility.SUBJECT ||
    thread.visibility === MessageChannelVisibility.SHARE_EVERYTHING;

  if (isSubjectVisible && isNonEmptyString(thread.subject)) {
    return thread.subject;
  }

  return isChatTimelineThreadChannel(thread.channel)
    ? t`Conversation`
    : t`Email thread`;
};
