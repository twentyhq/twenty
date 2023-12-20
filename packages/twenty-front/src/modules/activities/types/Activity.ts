import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type ActivityType = 'Task' | 'Note';

export type Activity = {
  __typename: 'Activity';
  id: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  reminderAt: string | null;
  dueAt: string | null;
  activityTargets: ActivityTarget[];
  type: ActivityType;
  title: string;
  body: string;
  author: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'>;
  authorId: string;
  assignee: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'> | null;
  assigneeId: string | null;
  comments: Comment[];
};
