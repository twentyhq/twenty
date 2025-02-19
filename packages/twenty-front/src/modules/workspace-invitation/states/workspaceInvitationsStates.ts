import { WorkspaceInvitation } from '@/workspace-member/types/WorkspaceMember';
import { createState } from '@ui/utilities/state/utils/createState';

export const workspaceInvitationsState = createState<
  Omit<WorkspaceInvitation, '__typename'>[]
>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
