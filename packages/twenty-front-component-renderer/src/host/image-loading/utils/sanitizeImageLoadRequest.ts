import { isNull, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { resolveImageLoadReferrerPolicy } from '@/host/image-loading/utils/resolveImageLoadReferrerPolicy';
import { type ImageLoadRequest } from '@/types/image/ImageLoadRequest';

export const sanitizeImageLoadRequest = (
  request: unknown,
): ImageLoadRequest | null => {
  if (!isPlainObject(request)) {
    return null;
  }

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
