import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

export type TimelineActivityType = TimelineActivityTypeSnapshot & {
  isActive?: boolean;
};
