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
  dueAt: string | null;
  activityTargets: ActivityTarget[];
  type: ActivityType;
  title: string;
  body: string;
  author: WorkspaceMember;
  authorId: string;
  assignee: WorkspaceMember | null;
  assigneeId: string | null;
  comments: Comment[];
};
