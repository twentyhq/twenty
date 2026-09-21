import { type Activity } from '@/activities/types/Activity';

export type Note = Activity & {
  __typename: 'Note';
};
