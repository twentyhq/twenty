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
  if (isChatTimelineThreadChannel(thread.channel)) {
    return t`Conversation`;
  }

  const isSubjectVisible =
    thread.visibility === MessageChannelVisibility.SUBJECT ||
    thread.visibility === MessageChannelVisibility.SHARE_EVERYTHING;

  return isSubjectVisible && isNonEmptyString(thread.subject)
    ? thread.subject
    : t`Email thread`;
};
