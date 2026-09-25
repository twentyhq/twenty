import { type FindManyTimelineActivityTypesQuery } from '~/generated-metadata/graphql';

export type InstalledTimelineActivityType =
  FindManyTimelineActivityTypesQuery['timelineActivityTypes'][number];
