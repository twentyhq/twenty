import { MetadataApiClient } from 'twenty-client-sdk/metadata';

// Servers before the rename to WORKSPACE_APPS report this flag as APPLICATIONS.
const MANAGE_APPS_PERMISSION_FLAG_KEYS = ['WORKSPACE_APPS', 'APPLICATIONS'];

export const currentUserCanManageGranolaOrThrow =
  async (): Promise<boolean> => {
    const { currentUser } = await new MetadataApiClient().query({
      currentUser: { currentUserWorkspace: { permissionFlags: true } },
    });

    const permissionFlags: string[] =
      currentUser.currentUserWorkspace?.permissionFlags ?? [];

    return MANAGE_APPS_PERMISSION_FLAG_KEYS.some((key) =>
      permissionFlags.includes(key),
    );
  };
