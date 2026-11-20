import {
  MetadataApiClient,
  type MetadataSchema,
} from 'twenty-client-sdk/metadata';

export const currentUserHasPermissionFlag = async (
  permissionFlag: MetadataSchema.PermissionFlagType,
): Promise<boolean> => {
  try {
    const { currentUser } = await new MetadataApiClient().query({
      currentUser: {
        currentUserWorkspace: {
          permissionFlags: true,
        },
      },
    });

    return (currentUser.currentUserWorkspace?.permissionFlags ?? []).includes(
      permissionFlag,
    );
  } catch {
    return false;
  }
};
