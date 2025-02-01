import { WorkspaceInvitation } from '@/workspace-member/types/WorkspaceMember';
import { createState } from "twenty-shared";

export const workspaceInvitationsState = createState<
  Omit<WorkspaceInvitation, '__typename'>[]
>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
