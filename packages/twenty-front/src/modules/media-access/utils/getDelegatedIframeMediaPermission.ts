import { isIframeMediaPermissionCovered } from '@/media-access/utils/isIframeMediaPermissionCovered';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getDelegatedIframeMediaPermission = ({
  activatedPermission,
  permission,
}: {
  activatedPermission: IframeMediaPermission | null;
  permission: IframeMediaPermission | null;
}): IframeMediaPermission | null => {
  if (!isDefined(activatedPermission)) {
    return null;
  }

  return isIframeMediaPermissionCovered({
    permission: activatedPermission,
    coveringPermission: permission,
  })
    ? activatedPermission
    : null;
};
