import { type IframeMediaPermission } from 'twenty-shared/types';

import { buildIframeMediaPermissionsPolicy } from 'src/engine/core-modules/frontend/utils/build-iframe-media-permissions-policy.util';

export const buildDocumentPermissionsPolicy = (
  iframeMediaPermissions: IframeMediaPermission[],
): string =>
  `${buildIframeMediaPermissionsPolicy(iframeMediaPermissions)}, geolocation=()`;
