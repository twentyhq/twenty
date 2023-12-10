import { Activity } from '@/activities/types/Activity';

export type Note = Activity & {
  type: 'Note';
};
