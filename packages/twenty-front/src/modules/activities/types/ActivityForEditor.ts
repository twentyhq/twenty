import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';

export type ActivityForEditor = Partial<Task | Note> &
  Partial<Pick<Task, 'status' | 'dueAt' | 'assignee' | 'taskTargets'>> &
  Partial<Pick<Note, 'noteTargets'>>;
