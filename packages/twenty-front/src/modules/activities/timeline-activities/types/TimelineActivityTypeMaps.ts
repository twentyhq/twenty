import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';

export type TimelineActivityTypeMaps = {
  byId: ReadonlyMap<string, TimelineActivityType>;
  byUniversalIdentifier: ReadonlyMap<string, TimelineActivityType>;
};
