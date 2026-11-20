import { MetadataSchema } from 'twenty-client-sdk/metadata';

import { currentUserHasPermissionFlag } from 'src/features/chat/logic-functions/utils/current-user-has-permission-flag';

export const currentUserHasApplicationsPermission = (): Promise<boolean> =>
  currentUserHasPermissionFlag(
    MetadataSchema.enumPermissionFlagType.APPLICATIONS,
  );
