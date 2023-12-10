import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type Comment = {
  id: string;
  createdAt: string;
  body: string;
  updatedAt: string;
  activityId: string;
  author: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'>;
};
