import { isDefined } from 'twenty-shared/utils';

import { type ImageLoadingHost } from '@/types/image/ImageLoadingHost';
import { type ImageLoadResult } from '@/types/image/ImageLoadResult';

type CreateImagePreloaderClassInput = Pick<
  ImageLoadingHost,
  'loadImage' | 'cancelImage'
>;

export const createImagePreloaderClass = ({
  loadImage,
  cancelImage,
}: CreateImagePreloaderClassInput) => {
  let nextRequestId = 0;

  return class ImagePreloader {
    onload: ((event: Event) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    crossOrigin: string | null = null;
    referrerPolicy = '';

    #source = '';
    #requestId: string | null = null;
    #isComplete = true;
    #width = 0;
    #height = 0;

    get src(): string {
      return this.#source;
    }

    set src(source: string) {
      const previousRequestId = this.#requestId;
      const requestId = String(++nextRequestId);

      this.#requestId = requestId;
      this.#source = String(source);
      this.#isComplete = false;
      this.#width = 0;
      this.#height = 0;

      if (isDefined(previousRequestId)) {
        void cancelImage(previousRequestId).catch(() => {});
      }

      const finish = (result: ImageLoadResult) => {
        if (this.#requestId !== requestId) {
          return;
        }

        this.#requestId = null;
        this.#isComplete = true;
        this.#width = result.naturalWidth;
        this.#height = result.naturalHeight;

        if (result.status === 'loaded') {
          this.onload?.(new Event('load'));
          return;
        }

        if (result.status === 'error') {
          this.onerror?.(new Event('error'));
        }
      };

      void loadImage({
        requestId,
        src: this.#source,
        crossOrigin: this.crossOrigin,
        referrerPolicy: this.referrerPolicy,
      }).then(finish, () =>
        finish({ status: 'error', naturalWidth: 0, naturalHeight: 0 }),
      );
    }

    get complete(): boolean {
      return this.#isComplete;
    }

    get naturalWidth(): number {
      return this.#width;
    }

    get naturalHeight(): number {
      return this.#height;
    }
  };
};
