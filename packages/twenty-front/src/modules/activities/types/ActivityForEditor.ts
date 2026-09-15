import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';

export type ActivityForEditor = Partial<Task | Note>;
