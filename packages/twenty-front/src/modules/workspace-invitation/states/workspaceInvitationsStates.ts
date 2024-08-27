import { createState } from 'twenty-ui';

type WorkspaceInvitation = {
  id: string;
  email: string;
  expiresAt: string;
};

export const workspaceInvitationsState = createState<WorkspaceInvitation[]>({
  key: 'workspaceInvitationsState',
  defaultValue: [],
});
