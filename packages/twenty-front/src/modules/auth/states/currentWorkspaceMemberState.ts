import { createState } from "twenty-shared";

import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type CurrentWorkspaceMember = Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | 'userEmail' | '__typename'
>;

export const currentWorkspaceMemberState =
  createState<CurrentWorkspaceMember | null>({
    key: 'currentWorkspaceMemberState',
    defaultValue: null,
  });
