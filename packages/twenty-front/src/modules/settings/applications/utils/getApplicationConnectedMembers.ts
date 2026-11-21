import { type SettingsApplicationConnectedMember } from '@/settings/applications/types/SettingsApplicationConnectedMember';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { type WorkspaceApplicationAuthorizationsQuery } from '~/generated-metadata/graphql';

export const getApplicationConnectedMembers = ({
  applicationId,
  applicationAuthorizations,
  workspaceMembers,
}: {
  applicationId: string;
  applicationAuthorizations: WorkspaceApplicationAuthorizationsQuery['workspaceApplicationAuthorizations'];
  workspaceMembers: PartialWorkspaceMember[];
}): SettingsApplicationConnectedMember[] => {
  const workspaceMemberByUserId = new Map(
    workspaceMembers.map((workspaceMember) => [
      workspaceMember.userId,
      workspaceMember,
    ]),
  );

  return applicationAuthorizations
    .filter(
      (applicationAuthorization) =>
        applicationAuthorization.applicationId === applicationId,
    )
    .map((applicationAuthorization) => ({
      ...applicationAuthorization,
      workspaceMember: workspaceMemberByUserId.get(
        applicationAuthorization.userId,
      ),
    }));
};
