import { type TimelineThreadChannelFilter } from '@/activities/emails/types/TimelineThreadChannelFilter';

export const getTimelineThreadChannelFilterKey = ({
  type,
  provider,
  applicationId,
}: TimelineThreadChannelFilter): string =>
  `${type}:${provider}:${applicationId ?? ''}`;
