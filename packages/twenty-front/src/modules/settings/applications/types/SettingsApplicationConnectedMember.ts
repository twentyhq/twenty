import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { type WorkspaceApplicationAuthorizationsQuery } from '~/generated-metadata/graphql';

export type SettingsApplicationConnectedMember =
  WorkspaceApplicationAuthorizationsQuery['workspaceApplicationAuthorizations'][number] & {
    workspaceMember?: PartialWorkspaceMember;
  };
