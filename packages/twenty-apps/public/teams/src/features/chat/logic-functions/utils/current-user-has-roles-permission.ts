import { MetadataApiClient, MetadataSchema } from 'twenty-client-sdk/metadata';

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
      MetadataSchema.enumPermissionFlagType.ROLES,
    );
  } catch {
    return false;
  }
};
