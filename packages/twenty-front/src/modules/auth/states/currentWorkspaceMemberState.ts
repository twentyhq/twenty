import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { createState } from 'twenty-ui/utilities';

export type CurrentWorkspaceMember = Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | 'userEmail' | '__typename' | 'agentId'
>;

export const currentWorkspaceMemberState =
  createState<CurrentWorkspaceMember | null>({
    key: 'currentWorkspaceMemberState',
    defaultValue: null,
  });
