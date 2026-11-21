import { MetadataSchema } from 'twenty-client-sdk/metadata';

import { currentUserHasPermissionFlag } from 'src/features/chat/logic-functions/utils/current-user-has-permission-flag';

export const currentUserHasRolesPermission = (): Promise<boolean> =>
  currentUserHasPermissionFlag(MetadataSchema.enumPermissionFlagType.ROLES);
