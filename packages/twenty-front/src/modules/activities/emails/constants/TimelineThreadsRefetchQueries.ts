import { getTimelineThreadChannelsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadChannelsFromObjectRecord';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';

export const TIMELINE_THREADS_REFETCH_QUERIES = [
  getTimelineThreadsFromObjectRecord,
  getTimelineThreadChannelsFromObjectRecord,
];
