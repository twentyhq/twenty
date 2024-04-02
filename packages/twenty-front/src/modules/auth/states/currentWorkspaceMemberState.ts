import { createState } from 'twenty-ui';

import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const currentWorkspaceMemberState = createState<Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | 'userEmail'
> | null>({
  key: 'currentWorkspaceMemberState',
  defaultValue: null,
});
