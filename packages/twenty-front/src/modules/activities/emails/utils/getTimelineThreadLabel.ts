import { t } from '@lingui/core/macro';

import { getVisibleTimelineThreadSubject } from '@/activities/emails/utils/getVisibleTimelineThreadSubject';
import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';
import { type TimelineThread } from '~/generated/graphql';

export const getTimelineThreadLabel = (
  thread: Pick<TimelineThread, 'subject' | 'visibility' | 'channel'>,
) => {
  const fallbackLabel = isChatTimelineThreadChannel(thread.channel)
    ? t`Conversation`
    : t`Email thread`;

  return getVisibleTimelineThreadSubject(thread) ?? fallbackLabel;
};
