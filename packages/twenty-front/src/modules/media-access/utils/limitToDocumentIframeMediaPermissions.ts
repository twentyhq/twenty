import { getDocumentIframeMediaPermissions } from '@/media-access/utils/getDocumentIframeMediaPermissions';
import { intersectIframeMediaPermissions } from '@/media-access/utils/intersectIframeMediaPermissions';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
