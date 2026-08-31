import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const WORKSPACE_MEMBERS_PERMISSION_FLAG = 'WORKSPACE_MEMBERS';

export const currentUserHasWorkspaceMembersPermission =
  async (): Promise<boolean> => {
    try {
      const { currentUser } = await new MetadataApiClient().query({
        currentUser: {
          currentUserWorkspace: {
            permissionFlags: true,
          },
        },
      });

      return (currentUser.currentUserWorkspace?.permissionFlags ?? []).includes(
        WORKSPACE_MEMBERS_PERMISSION_FLAG,
      );
    } catch {
      return false;
    }
  };
