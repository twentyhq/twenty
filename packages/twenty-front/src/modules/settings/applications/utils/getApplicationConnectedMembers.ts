import { type SettingsApplicationConnectedMember } from '@/settings/applications/types/SettingsApplicationConnectedMember';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { type WorkspaceApplicationAuthorizationsQuery } from '~/generated-metadata/graphql';

export const getApplicationConnectedMembers = ({
  applicationAuthorizations,
  workspaceMembers,
}: {
  applicationAuthorizations: WorkspaceApplicationAuthorizationsQuery['workspaceApplicationAuthorizations'];
  workspaceMembers: PartialWorkspaceMember[];
}): SettingsApplicationConnectedMember[] => {
  const workspaceMemberByUserId = new Map(
    workspaceMembers.map((workspaceMember) => [
      workspaceMember.userId,
      workspaceMember,
    ]),
  );

  return applicationAuthorizations.map((applicationAuthorization) => ({
    ...applicationAuthorization,
    workspaceMember: workspaceMemberByUserId.get(
      applicationAuthorization.userId,
    ),
  }));
};
