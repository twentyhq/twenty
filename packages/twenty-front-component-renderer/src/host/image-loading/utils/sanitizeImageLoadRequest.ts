import { isNull, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { resolveImageLoadReferrerPolicy } from '@/host/image-loading/utils/resolveImageLoadReferrerPolicy';
import { resolveImageSourceAttribute } from '@/host/image-loading/utils/resolveImageSourceAttribute';
import { type ImageLoadRequest } from '@/types/image/ImageLoadRequest';

export const sanitizeImageLoadRequest = (
  request: unknown,
): ImageLoadRequest | null => {
  if (!isPlainObject(request)) {
    return null;
  }

  const src = resolveImageSourceAttribute(request.src);
  const srcset = resolveImageSourceAttribute(request.srcset);

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
