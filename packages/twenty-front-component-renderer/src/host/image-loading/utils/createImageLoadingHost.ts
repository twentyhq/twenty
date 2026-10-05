import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MAX_PENDING_IMAGE_LOADS } from '@/host/image-loading/constants/MaxPendingImageLoads';
import { sanitizeImageLoadRequest } from '@/host/image-loading/utils/sanitizeImageLoadRequest';
import { type ImageLoadingHost } from '@/types/image/ImageLoadingHost';
import { type ImageLoadResult } from '@/types/image/ImageLoadResult';

type CreateImageLoadingHostOptions = {
  createImage?: () => HTMLImageElement;
};

const createUnloadedImageResult = (
  status: Exclude<ImageLoadResult['status'], 'loaded'>,
): ImageLoadResult => ({
  status,
  naturalWidth: 0,
  naturalHeight: 0,
  currentSrc: '',
});

export const createImageLoadingHost = ({
  createImage = () => new Image(),
}: CreateImageLoadingHostOptions = {}): ImageLoadingHost => {
  const pendingRequests = new Map<
    string,
    (status: ImageLoadResult['status']) => void
  >();
  let isDisposed = false;

  const cancelImage = async (requestId: string): Promise<void> => {
    pendingRequests.get(requestId)?.('cancelled');
  };

  const loadImage: ImageLoadingHost['loadImage'] = (request) => {
    if (isDisposed) {
      return Promise.resolve(createUnloadedImageResult('cancelled'));
    }

    const sanitizedRequest = sanitizeImageLoadRequest(request);

    if (!isDefined(sanitizedRequest)) {
      return Promise.resolve(createUnloadedImageResult('error'));
    }

    const { requestId, src, srcset, sizes, crossOrigin, referrerPolicy } =
      sanitizedRequest;

    pendingRequests.get(requestId)?.('cancelled');

    if (pendingRequests.size >= MAX_PENDING_IMAGE_LOADS) {
      return Promise.resolve(createUnloadedImageResult('error'));
    }

    return new Promise((resolve) => {
      const image = createImage();

      const finishRequest = (status: ImageLoadResult['status']): void => {
        if (pendingRequests.get(requestId) !== finishRequest) {
          return;
        }

        pendingRequests.delete(requestId);
        image.onload = null;
        image.onerror = null;
        const result: ImageLoadResult = {
          status,
          naturalWidth: status === 'loaded' ? image.naturalWidth : 0,
          naturalHeight: status === 'loaded' ? image.naturalHeight : 0,
          currentSrc: status === 'cancelled' ? '' : image.currentSrc,
        };

        image.removeAttribute('srcset');
        image.removeAttribute('src');
        resolve(result);
      };

      pendingRequests.set(requestId, finishRequest);
      image.onload = () => finishRequest('loaded');
      image.onerror = () => finishRequest('error');
      image.crossOrigin = crossOrigin;
      image.referrerPolicy = referrerPolicy;

      if (isNonEmptyString(sizes)) {
        image.sizes = sizes;
      }

      if (isDefined(srcset)) {
        image.srcset = srcset;
      }

      if (isDefined(src)) {
        image.src = src;
      }

      if (image.complete && image.naturalWidth > 0) {
        finishRequest('loaded');
      }

      queueMicrotask(() => {
        if (image.complete && !isNonEmptyString(image.currentSrc)) {
          finishRequest('error');
        }
      });
    });
  };

  const dispose = (): void => {
    isDisposed = true;

    for (const finishRequest of pendingRequests.values()) {
      finishRequest('cancelled');
    }
  };

  return { loadImage, cancelImage, dispose };
};
