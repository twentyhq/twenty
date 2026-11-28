import { isNonEmptyString } from '@sniptt/guards';

import {
  MessageChannelVisibility,
  type TimelineThread,
} from '~/generated/graphql';

export const getVisibleTimelineThreadSubject = (
  thread: Pick<TimelineThread, 'subject' | 'visibility'>,
) => {
  const isSubjectVisible =
    thread.visibility === MessageChannelVisibility.SUBJECT ||
    thread.visibility === MessageChannelVisibility.SHARE_EVERYTHING;

  return isSubjectVisible && isNonEmptyString(thread.subject)
    ? thread.subject
    : undefined;
};
