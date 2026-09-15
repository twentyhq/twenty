import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const ROLES_PERMISSION_FLAG = 'ROLES';

export const currentUserHasRolesPermission = async (): Promise<boolean> => {
  try {
    const { currentUser } = await new MetadataApiClient().query({
      currentUser: {
        currentUserWorkspace: {
          permissionFlags: true,
        },
      },
    });

    return (currentUser.currentUserWorkspace?.permissionFlags ?? []).includes(
      ROLES_PERMISSION_FLAG,
    );
  } catch {
    return false;
  }
};
