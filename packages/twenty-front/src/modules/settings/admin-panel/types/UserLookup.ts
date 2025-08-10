import { type WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';

export type UserLookup = {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  workspaces: WorkspaceInfo[];
};
