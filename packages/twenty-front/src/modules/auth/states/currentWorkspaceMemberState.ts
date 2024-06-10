import { createState } from 'twenty-ui';

import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type CurrentWorkspaceMemberState = Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | 'userEmail' | '__typename'
>;

export const currentWorkspaceMemberState =
  createState<CurrentWorkspaceMemberState | null>({
    key: 'currentWorkspaceMemberState',
    defaultValue: null,
  });
