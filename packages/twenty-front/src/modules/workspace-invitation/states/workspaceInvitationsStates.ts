import { type WorkspaceInvitation } from '@/workspace-member/types/WorkspaceMember';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workspaceInvitationsState = createStateV2<
  Omit<WorkspaceInvitation, '__typename'>[]
>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
