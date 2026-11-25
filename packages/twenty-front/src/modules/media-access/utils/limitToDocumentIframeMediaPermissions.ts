import { getDocumentIframeMediaPermissions } from '@/media-access/utils/getDocumentIframeMediaPermissions';
import { type IframeMediaPermission } from 'twenty-shared/types';
import {
  intersectIframeMediaPermissions,
  isDefined,
} from 'twenty-shared/utils';

export const limitToDocumentIframeMediaPermissions = (
  permissions: readonly IframeMediaPermission[],
): readonly IframeMediaPermission[] => {
  const documentPermissions = getDocumentIframeMediaPermissions();

  return isDefined(documentPermissions)
    ? intersectIframeMediaPermissions({
        permissions,
        allowedPermissions: documentPermissions,
      })
    : permissions;
};
