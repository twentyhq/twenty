import { msg } from '@lingui/core/macro';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const buildPermissionFlagDeniedException = (): PermissionsException =>
  new PermissionsException(
    PermissionsExceptionMessage.PERMISSION_DENIED,
    PermissionsExceptionCode.PERMISSION_DENIED,
    {
      userFriendlyMessage: msg`You do not have permission to access this feature. Please contact your workspace administrator for access.`,
    },
  );
