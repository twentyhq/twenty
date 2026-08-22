import {
  type TimelineActivityAction,
  type TimelineActivityRenderer,
} from 'twenty-shared/timeline';

export type TimelineActivityType = {
  id: string;
  name: string;
  label: string;
  action: TimelineActivityAction | null;
  icon: string | null;
  renderer: TimelineActivityRenderer | null;
  objectUniversalIdentifier: string | null;
};
