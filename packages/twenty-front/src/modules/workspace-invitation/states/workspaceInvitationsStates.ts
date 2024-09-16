import { createState } from 'twenty-ui';
import { WorkspaceInvitation } from '@/workspace-member/types/WorkspaceMember';

export const workspaceInvitationsState = createState<
  Omit<WorkspaceInvitation, '__typename'>[]
>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
