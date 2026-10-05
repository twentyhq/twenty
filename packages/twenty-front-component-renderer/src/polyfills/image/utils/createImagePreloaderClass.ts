import { isDefined } from 'twenty-shared/utils';

import { normalizeImageDimensionAttribute } from '@/polyfills/image/utils/normalizeImageDimensionAttribute';
import { createDomException } from '@/polyfills/utils/createDomException';
import { type ImageLoadResult } from '@/types/image/ImageLoadResult';
import { type ImageLoadingTransport } from '@/types/image/ImageLoadingTransport';

type ImagePreloaderState = 'idle' | 'loading' | 'loaded' | 'broken';

type PendingImageDecode = {
  resolve: () => void;
  reject: (error: Error) => void;
};

const TRANSPORT_FAILURE_IMAGE_LOAD_RESULT: ImageLoadResult = {
  status: 'error',
  naturalWidth: 0,
  naturalHeight: 0,
  currentSrc: '',
};

const createImageDecodeError = (): Error =>
  createDomException('The source image cannot be decoded.', 'EncodingError');

export const createImagePreloaderClass = ({
  loadImage,
  cancelImage,
}: ImageLoadingTransport) => {
  let nextRequestId = 0;

  return class ImagePreloader extends EventTarget {
    #source: string | null = null;
    #sourceSet: string | null = null;
    #sizes = '';
    #crossOrigin: string | null = null;
    #referrerPolicy = '';
    #widthAttribute: number | null = null;
    #heightAttribute: number | null = null;

    #state: ImagePreloaderState = 'idle';
    #requestId: string | null = null;
    #hostRequestId: string | null = null;
    #currentSource = '';
    #naturalWidth = 0;
    #naturalHeight = 0;
    #pendingDecodes = new Set<PendingImageDecode>();
    #eventHandlers = new Map<string, EventListener>();

    constructor(width?: number, height?: number) {
      super();

      if (isDefined(width)) {
        this.width = width;
      }

      if (isDefined(height)) {
        this.height = height;
      }
    }

    get src(): string {
      return this.#source ?? '';
    }

    set src(source: string) {
      this.#source = String(source);
      this.#updateImageData();
    }

    get srcset(): string {
      return this.#sourceSet ?? '';
    }

    set srcset(sourceSet: string) {
      this.#sourceSet = String(sourceSet);
      this.#updateImageData();
    }

    get sizes(): string {
      return this.#sizes;
    }

    set sizes(sizes: string) {
      this.#sizes = String(sizes);
      this.#updateImageData();
    }

    get crossOrigin(): string | null {
      return this.#crossOrigin;
    }

    set crossOrigin(crossOrigin: string | null) {
      const nextCrossOrigin = crossOrigin === null ? null : String(crossOrigin);

      if (nextCrossOrigin === this.#crossOrigin) {
        return;
      }

      this.#crossOrigin = nextCrossOrigin;
      this.#updateImageData();
    }

    get referrerPolicy(): string {
      return this.#referrerPolicy;
    }

    set referrerPolicy(referrerPolicy: string) {
      const nextReferrerPolicy = String(referrerPolicy);

      if (nextReferrerPolicy === this.#referrerPolicy) {
        return;
      }

      this.#referrerPolicy = nextReferrerPolicy;
      this.#updateImageData();
    }

    get width(): number {
      return this.#widthAttribute ?? this.#naturalWidth;
    }

    set width(width: number) {
      this.#widthAttribute = normalizeImageDimensionAttribute(width);
    }

    get height(): number {
      return this.#heightAttribute ?? this.#naturalHeight;
    }

    set height(height: number) {
      this.#heightAttribute = normalizeImageDimensionAttribute(height);
    }

    get complete(): boolean {
      return this.#state !== 'loading';
    }

    get currentSrc(): string {
      return this.#currentSource;
    }

    get naturalWidth(): number {
      return this.#naturalWidth;
    }

    get naturalHeight(): number {
      return this.#naturalHeight;
    }

    get onload(): EventListener | null {
      return this.#getEventHandler('load');
    }

    set onload(handler: EventListener | null) {
      this.#setEventHandler('load', handler);
    }

    get onerror(): EventListener | null {
      return this.#getEventHandler('error');
    }

    set onerror(handler: EventListener | null) {
      this.#setEventHandler('error', handler);
    }

    decode(): Promise<void> {
      if (this.#state === 'loaded') {
        return Promise.resolve();
      }

      if (this.#state !== 'loading') {
        return Promise.reject(createImageDecodeError());
      }

      return new Promise((resolve, reject) => {
        this.#pendingDecodes.add({ resolve, reject });
      });
    }

    #updateImageData(): void {
      const previousHostRequestId = this.#hostRequestId;

      this.#hostRequestId = null;
      this.#naturalWidth = 0;
      this.#naturalHeight = 0;
      this.#settlePendingDecodes();

      if (isDefined(previousHostRequestId)) {
        void cancelImage(previousHostRequestId).catch(() => {});
      }

      if (this.#source === null && this.#sourceSet === null) {
        this.#requestId = null;
        this.#state = 'idle';
        this.#currentSource = '';
        return;
      }

      const requestId = String(++nextRequestId);

      this.#requestId = requestId;
      this.#state = 'loading';

      queueMicrotask(() => this.#sendImageRequest(requestId));
    }

    #sendImageRequest(requestId: string): void {
      if (this.#requestId !== requestId) {
        return;
      }

      this.#hostRequestId = requestId;

      void loadImage({
        requestId,
        src: this.#source,
        srcset: this.#sourceSet,
        sizes: this.#sizes,
        crossOrigin: this.#crossOrigin,
        referrerPolicy: this.#referrerPolicy,
      }).then(
        (result) => this.#settleImageRequest({ requestId, result }),
        () =>
          this.#settleImageRequest({
            requestId,
            result: TRANSPORT_FAILURE_IMAGE_LOAD_RESULT,
          }),
      );
    }

    #settleImageRequest({
      requestId,
      result,
    }: {
      requestId: string;
      result: ImageLoadResult;
    }): void {
      if (this.#requestId !== requestId) {
        return;
      }

      this.#requestId = null;
      this.#hostRequestId = null;
      this.#state = result.status === 'loaded' ? 'loaded' : 'broken';
      this.#currentSource = result.currentSrc;
      this.#naturalWidth = result.naturalWidth;
      this.#naturalHeight = result.naturalHeight;
      this.#settlePendingDecodes();

      if (result.status === 'cancelled') {
        return;
      }

      this.dispatchEvent(
        new Event(result.status === 'loaded' ? 'load' : 'error'),
      );
    }

    #settlePendingDecodes(): void {
      for (const pendingDecode of this.#pendingDecodes) {
        if (this.#state === 'loaded') {
          pendingDecode.resolve();
          continue;
        }

        pendingDecode.reject(createImageDecodeError());
      }

      this.#pendingDecodes.clear();
    }

    #getEventHandler(eventType: string): EventListener | null {
      return this.#eventHandlers.get(eventType) ?? null;
    }

    #setEventHandler(eventType: string, handler: EventListener | null): void {
      const previousHandler = this.#eventHandlers.get(eventType);

      if (isDefined(previousHandler)) {
        this.removeEventListener(eventType, previousHandler);
        this.#eventHandlers.delete(eventType);
      }

      if (handler !== null) {
        this.#eventHandlers.set(eventType, handler);
        this.addEventListener(eventType, handler);
      }
    }
  };
};
