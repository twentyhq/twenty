import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const APPLICATIONS_PERMISSION_FLAG = 'APPLICATIONS';

export const currentUserCanManageApplications = async (): Promise<boolean> => {
  try {
    const { currentUser } = await new MetadataApiClient().query({
      currentUser: {
        currentUserWorkspace: {
          permissionFlags: true,
        },
      },
    });

    return (currentUser.currentUserWorkspace?.permissionFlags ?? []).includes(
      APPLICATIONS_PERMISSION_FLAG,
    );
  } catch {
    return false;
  }
};
