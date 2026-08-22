import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type TimelineActivityType = {
  id: string;
  universalIdentifier: string;
  name: string;
  label: string;
  action: TimelineActivityAction | null;
  icon: string | null;
  objectUniversalIdentifier: string | null;
  frontComponentUniversalIdentifier: string | null;
};
