import { Activity } from '@/activities/types/Activity';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';

export type ActivityForEditor = Pick<
  Activity,
  'id' | 'title' | 'body' | 'updatedAt' | '__typename'
> &
  Partial<Pick<Task, 'status' | 'dueAt' | 'assignee' | 'taskTargets'>> &
  Partial<Pick<Note, 'noteTargets'>>;
