import { type ImageLoadingHost } from '@/types/image/ImageLoadingHost';
import { type ImageLoadResult } from '@/types/image/ImageLoadResult';

type CreateImageLoadingHostOptions = {
  createImage?: () => HTMLImageElement;
};

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

  const loadImage: ImageLoadingHost['loadImage'] = ({
    requestId,
    src,
    crossOrigin,
    referrerPolicy,
  }) => {
    if (isDisposed) {
      return Promise.resolve({
        status: 'cancelled',
        naturalWidth: 0,
        naturalHeight: 0,
      });
    }

    pendingRequests.get(requestId)?.('cancelled');

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
        };

        image.removeAttribute('src');
        resolve(result);
      };

      pendingRequests.set(requestId, finishRequest);
      image.onload = () => finishRequest('loaded');
      image.onerror = () => finishRequest('error');
      image.crossOrigin = crossOrigin;
      image.referrerPolicy = referrerPolicy;
      image.src = src;

      if (image.complete) {
        finishRequest(image.naturalWidth > 0 ? 'loaded' : 'error');
      }
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
