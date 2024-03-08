import { createState } from '@/ui/utilities/state/utils/createState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const currentWorkspaceMemberState = createState<Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | 'userEmail'
> | null>({
  key: 'currentWorkspaceMemberState',
  defaultValue: null,
});
