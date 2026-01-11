import { type CommentTarget } from '@/activities/comments/types/CommentTarget';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type Comment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  body: {
    blocknote: string | null;
    markdown: string | null;
  } | null;
  author: Pick<
    WorkspaceMember,
    'id' | 'name' | 'avatarUrl' | '__typename'
  > | null;
  authorId: string | null;
  commentTargets?: CommentTarget[];
  __typename: 'Comment';
};
