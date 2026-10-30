import { type IframeMediaPermission } from 'twenty-shared/types';

import { MAX_IFRAME_MEDIA_PERMISSIONS_POLICY_BYTES } from 'src/engine/core-modules/frontend/constants/max-iframe-media-permissions-policy-bytes.constant';
import { buildIframeMediaPermissionsPolicy } from 'src/engine/core-modules/frontend/utils/build-iframe-media-permissions-policy.util';

export const isIframeMediaPermissionsPolicyWithinSizeLimit = (
  permissions: IframeMediaPermission[],
): boolean =>
  Buffer.byteLength(buildIframeMediaPermissionsPolicy(permissions)) <=
  MAX_IFRAME_MEDIA_PERMISSIONS_POLICY_BYTES;
