import { WorkspaceInvitation } from '@/workspace-member/types/WorkspaceMember';
import { createState } from "twenty-ui";

export const workspaceInvitationsState = createState<
  Omit<WorkspaceInvitation, '__typename'>[]
>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
