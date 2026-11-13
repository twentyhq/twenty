import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export type InboxMessageAuthorLookup<
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  > = PartialWorkspaceMember,
> = {
  workspaceMembers: TWorkspaceMember[];
  assistantDisplayName: string;
  currentWorkspace:
    | Pick<
        CurrentWorkspace,
        'installedApplications' | 'workspaceCustomApplication'
      >
    | null
    | undefined;
};
