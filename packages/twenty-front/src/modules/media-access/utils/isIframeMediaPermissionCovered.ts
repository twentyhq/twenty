import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isIframeMediaPermissionCovered = ({
  permission,
  coveringPermission,
}: {
  permission: IframeMediaPermission;
  coveringPermission: IframeMediaPermission | null;
}): boolean =>
  isDefined(coveringPermission) &&
  coveringPermission.origin === permission.origin &&
  (!permission.microphone || coveringPermission.microphone) &&
  (!permission.camera || coveringPermission.camera);
