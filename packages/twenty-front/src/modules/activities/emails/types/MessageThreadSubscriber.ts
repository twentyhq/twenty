import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type MessageThreadSubscriber = {
  __typename: 'MessageThreadSubscriber';
  id: string;
  workspaceMember: WorkspaceMember;
};
