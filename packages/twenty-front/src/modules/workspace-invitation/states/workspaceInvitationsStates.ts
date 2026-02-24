import { type WorkspaceInvitation } from '@/workspace-member/types/WorkspaceMember';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const workspaceInvitationsState = createState<
  Omit<WorkspaceInvitation, '__typename'>[]
>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
