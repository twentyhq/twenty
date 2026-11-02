import { MEDIA_CAPABILITIES } from 'twenty-shared/constants';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined, normalizeIframeOrigin } from 'twenty-shared/utils';

export const buildIframeMediaPermissionsPolicy = (
  permissions: IframeMediaPermission[],
): string =>
  MEDIA_CAPABILITIES.map((capability) => {
    const origins = permissions
      .filter((permission) => permission[capability])
      .map((permission) =>
        normalizeIframeOrigin(permission.origin, { isHttpsOnly: true }),
      )
      .filter(isDefined);
    const allowedOrigins = [...new Set(origins)].map((origin) => `"${origin}"`);

    return `${capability}=(${['self', ...allowedOrigins].join(' ')})`;
  }).join(', ');
