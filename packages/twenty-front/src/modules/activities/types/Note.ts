import { type Activity } from '@/activities/types/Activity';
import { type NoteTarget } from '@/activities/types/NoteTarget';

export type Note = Activity & {
  noteTargets?: NoteTarget[];
  __typename: 'Note';
};
