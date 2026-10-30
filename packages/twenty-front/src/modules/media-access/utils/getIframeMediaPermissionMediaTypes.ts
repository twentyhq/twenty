import { type MediaSessionMediaType } from 'twenty-front-component-renderer';
import { type IframeMediaPermission } from 'twenty-shared/types';

export const getIframeMediaPermissionMediaTypes = (
  permission: IframeMediaPermission,
): MediaSessionMediaType[] => [
  ...(permission.microphone ? (['audio'] as const) : []),
  ...(permission.camera ? (['video'] as const) : []),
];
