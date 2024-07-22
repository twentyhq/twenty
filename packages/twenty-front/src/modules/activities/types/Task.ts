import { Activity } from '@/activities/types/Activity';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { WorkspaceMember } from '~/generated-metadata/graphql';

export type ActivityStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Task = Activity & {
  assignee: Pick<
    WorkspaceMember,
    'id' | 'name' | 'avatarUrl' | 'colorScheme'
  > | null;
  assigneeId: string | null;
  status: ActivityStatus | null;
  dueAt: string | null;
  taskTargets: TaskTarget[];
};
