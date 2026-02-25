import { type WorkspaceInvitation } from '@/workspace-member/types/WorkspaceMember';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workspaceInvitationsState = createAtomState<
  Omit<WorkspaceInvitation, '__typename'>[]
>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
