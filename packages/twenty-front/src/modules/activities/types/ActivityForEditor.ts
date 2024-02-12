import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { WorkspaceMember } from '~/generated-metadata/graphql';

export type ActivityForEditor = Pick<
  Activity,
  'id' | 'title' | 'body' | 'type' | 'completedAt' | 'dueAt' | 'updatedAt'
> & {
  comments?: Comment[];
} & {
  assignee?: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'> | null;
} & {
  activityTargets?: Array<
    Pick<
      ActivityTarget,
      'id' | 'companyId' | 'personId' | 'createdAt' | 'updatedAt' | 'activity'
    >
  >;
};
