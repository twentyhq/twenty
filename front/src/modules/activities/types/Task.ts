import { Activity } from '@/activities/types/Activity';

export type Task = Activity & {
  type: 'Task';
};
