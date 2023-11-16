import { Activity } from '@/activities/types/Activity';

export type TaskForList = Activity & {
  type: 'task';
};
