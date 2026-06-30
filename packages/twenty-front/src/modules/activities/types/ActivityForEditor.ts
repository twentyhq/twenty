import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';

export type ActivityForEditor = Partial<Task | Note> &
  Partial<Pick<Task, 'status' | 'dueAt' | 'assignee' | 'taskTargets'>> &
  Partial<Pick<Note, 'noteTargets'>>;
