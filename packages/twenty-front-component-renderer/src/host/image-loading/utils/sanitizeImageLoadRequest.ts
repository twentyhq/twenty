import { isNull, isString } from '@sniptt/guards';

import { resolveImageLoadReferrerPolicy } from '@/host/image-loading/utils/resolveImageLoadReferrerPolicy';
import { type ImageLoadRequest } from '@/types/image/ImageLoadRequest';

export const sanitizeImageLoadRequest = (
  request: Record<keyof ImageLoadRequest, unknown>,
): ImageLoadRequest | null => {
  const src = isString(request.src) ? request.src : null;
  const srcset = isString(request.srcset) ? request.srcset : null;

  if (!isString(request.requestId) || (isNull(src) && isNull(srcset))) {
    return null;
  }

  return {
    requestId: request.requestId,
    src,
    srcset,
    sizes: isString(request.sizes) ? request.sizes : '',
    crossOrigin: isString(request.crossOrigin) ? request.crossOrigin : null,
    referrerPolicy: resolveImageLoadReferrerPolicy(request.referrerPolicy),
  };
};
