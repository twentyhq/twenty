import { Comment } from 'xlsx-ugnis';

import { ActivityTarget } from '@/activities/types/AcitivytTarget';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type ActivityType = 'Task' | 'Note';

export type Activity = {
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
  assignee: WorkspaceMember | null;
  comments: Comment[];
};
