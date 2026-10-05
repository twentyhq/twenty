import { MAX_PENDING_IMAGE_LOADS } from '@/host/image-loading/constants/MaxPendingImageLoads';
import { type ImageLoadRequest } from '@/types/image/ImageLoadRequest';

import { createImageLoadingHost } from '../createImageLoadingHost';

const IMAGE_LOAD_REQUEST: ImageLoadRequest = {
  requestId: 'image-request',
  src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
  srcset: null,
  sizes: '',
  crossOrigin: 'anonymous',
  referrerPolicy: 'no-referrer',
};

const createImageHost = ({ isComplete = false, naturalWidth = 32 } = {}) => {
  const images: HTMLImageElement[] = [];
  const sourceOptions: {
    crossOrigin: string | null;
    referrerPolicy: string;
  }[] = [];
  const createImage = jest.fn(() => {
    const image = document.createElement('img');

    Object.defineProperties(image, {
      complete: { value: isComplete },
      naturalWidth: { value: naturalWidth },
      naturalHeight: { value: 16 },
      currentSrc: { get: () => image.getAttribute('src') ?? '' },
      src: {
        set: (src: string) => {
          sourceOptions.push({
            crossOrigin: image.crossOrigin,
            referrerPolicy: image.referrerPolicy,
          });
          image.setAttribute('src', src);
        },
      },
    });
    images.push(image);

    return image;
  });
  const host = createImageLoadingHost({ createImage });

  return { host, images, createImage, sourceOptions };
};

describe('createImageLoadingHost', () => {
  it('loads image resources with their request options and releases the native image', async () => {
    const { host, images, sourceOptions } = createImageHost();
    const result = host.loadImage(IMAGE_LOAD_REQUEST);
    const [image] = images;

    expect(image.getAttribute('src')).toBe(IMAGE_LOAD_REQUEST.src);
    expect(sourceOptions).toEqual([
      { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' },
    ]);
    expect(document.body.contains(image)).toBe(false);

    image.dispatchEvent(new Event('load'));

    await expect(result).resolves.toEqual({
      status: 'loaded',
      naturalWidth: 32,
      naturalHeight: 16,
      currentSrc: IMAGE_LOAD_REQUEST.src,
    });
    expect(image.onload).toBeNull();
    expect(image.onerror).toBeNull();
    expect(image.hasAttribute('src')).toBe(false);
  });

  it('reports broken sources without image dimensions', async () => {
    const { host, images } = createImageHost();
    const result = host.loadImage(IMAGE_LOAD_REQUEST);
    const [image] = images;

    image.dispatchEvent(new Event('error'));

    await expect(result).resolves.toEqual({
      status: 'error',
      naturalWidth: 0,
      naturalHeight: 0,
      currentSrc: IMAGE_LOAD_REQUEST.src,
    });
    expect(image.onload).toBeNull();
    expect(image.onerror).toBeNull();
    expect(image.hasAttribute('src')).toBe(false);
  });

  it('settles already decoded images without waiting for a load event', async () => {
    const { host } = createImageHost({ isComplete: true });

    await expect(host.loadImage(IMAGE_LOAD_REQUEST)).resolves.toEqual({
      status: 'loaded',
      naturalWidth: 32,
      naturalHeight: 16,
      currentSrc: IMAGE_LOAD_REQUEST.src,
    });
  });

  it('waits for the load event when a complete image has no natural width', async () => {
    const { host, images } = createImageHost({
      isComplete: true,
      naturalWidth: 0,
    });
    const result = host.loadImage(IMAGE_LOAD_REQUEST);
    const onSettled = jest.fn();

    void result.then(onSettled);
    await Promise.resolve();

    expect(onSettled).not.toHaveBeenCalled();

    images[0].dispatchEvent(new Event('load'));

    await expect(result).resolves.toMatchObject({
      status: 'loaded',
      naturalWidth: 0,
    });
  });

  it('loads srcset candidates without assigning a src attribute', async () => {
    const { host, images, sourceOptions } = createImageHost();
    const result = host.loadImage({
      ...IMAGE_LOAD_REQUEST,
      src: null,
      srcset: '/avatar.png 1x, /avatar@2x.png 2x',
      sizes: '40px',
    });
    const [image] = images;

    expect(image.getAttribute('srcset')).toBe(
      '/avatar.png 1x, /avatar@2x.png 2x',
    );
    expect(image.getAttribute('sizes')).toBe('40px');
    expect(image.hasAttribute('src')).toBe(false);
    expect(sourceOptions).toEqual([]);

    image.dispatchEvent(new Event('load'));

    await expect(result).resolves.toMatchObject({ status: 'loaded' });
    expect(image.hasAttribute('srcset')).toBe(false);
  });

  it('drops referrer policies that send the full page URL to other origins', () => {
    const { host, sourceOptions } = createImageHost();

    void host.loadImage({
      ...IMAGE_LOAD_REQUEST,
      referrerPolicy: 'unsafe-url',
    });
    void host.loadImage({
      ...IMAGE_LOAD_REQUEST,
      requestId: 'downgrade-request',
      referrerPolicy: 'no-referrer-when-downgrade',
    });
    void host.loadImage({
      ...IMAGE_LOAD_REQUEST,
      requestId: 'origin-request',
      referrerPolicy: 'ORIGIN',
    });

    expect(sourceOptions.map(({ referrerPolicy }) => referrerPolicy)).toEqual([
      '',
      '',
      'origin',
    ]);
  });

  it('reports an error without creating an image once the pending load limit is reached', async () => {
    const { host, createImage } = createImageHost();

    for (let index = 0; index < MAX_PENDING_IMAGE_LOADS; index++) {
      void host.loadImage({ ...IMAGE_LOAD_REQUEST, requestId: String(index) });
    }

    await expect(
      host.loadImage({ ...IMAGE_LOAD_REQUEST, requestId: 'over-limit' }),
    ).resolves.toEqual({
      status: 'error',
      naturalWidth: 0,
      naturalHeight: 0,
      currentSrc: '',
    });
    expect(createImage).toHaveBeenCalledTimes(MAX_PENDING_IMAGE_LOADS);

    await host.cancelImage('0');
    void host.loadImage({ ...IMAGE_LOAD_REQUEST, requestId: 'after-cancel' });

    expect(createImage).toHaveBeenCalledTimes(MAX_PENDING_IMAGE_LOADS + 1);
  });

  it('cancels an individual request and clears its event handlers', async () => {
    const { host, images } = createImageHost();
    const result = host.loadImage(IMAGE_LOAD_REQUEST);
    const [image] = images;

    await host.cancelImage(IMAGE_LOAD_REQUEST.requestId);

    await expect(result).resolves.toEqual({
      status: 'cancelled',
      naturalWidth: 0,
      naturalHeight: 0,
      currentSrc: '',
    });
    expect(image.onload).toBeNull();
    expect(image.onerror).toBeNull();
    expect(image.hasAttribute('src')).toBe(false);
  });

  it('ignores completion of a cancelled request after its identifier is reused', async () => {
    const { host, images } = createImageHost();
    const firstResult = host.loadImage(IMAGE_LOAD_REQUEST);
    const firstImage = images[0];
    const firstLoadHandler = firstImage.onload;
    const replacementResult = host.loadImage({
      ...IMAGE_LOAD_REQUEST,
      src: 'https://example.com/replacement.png',
    });
    const replacementImage = images[1];
    const onReplacementSettled = jest.fn();

    void replacementResult.then(onReplacementSettled);
    firstLoadHandler?.call(firstImage, new Event('load'));

    await expect(firstResult).resolves.toMatchObject({ status: 'cancelled' });
    expect(onReplacementSettled).not.toHaveBeenCalled();

    replacementImage.dispatchEvent(new Event('load'));

    await expect(replacementResult).resolves.toMatchObject({
      status: 'loaded',
    });
  });

  it('isolates matching request identifiers and teardown between renderer instances', async () => {
    const firstRenderer = createImageHost();
    const secondRenderer = createImageHost();
    const firstResult = firstRenderer.host.loadImage(IMAGE_LOAD_REQUEST);
    const secondResult = secondRenderer.host.loadImage(IMAGE_LOAD_REQUEST);
    const onFirstSettled = jest.fn();
    const onSecondSettled = jest.fn();

    void firstResult.then(onFirstSettled);
    void secondResult.then(onSecondSettled);
    await Promise.resolve();

    expect(onFirstSettled).not.toHaveBeenCalled();
    expect(onSecondSettled).not.toHaveBeenCalled();

    firstRenderer.host.dispose();

    await expect(firstResult).resolves.toMatchObject({ status: 'cancelled' });
    expect(onSecondSettled).not.toHaveBeenCalled();
    expect(secondRenderer.images[0].getAttribute('src')).toBe(
      IMAGE_LOAD_REQUEST.src,
    );

    secondRenderer.images[0].dispatchEvent(new Event('load'));

    await expect(secondResult).resolves.toEqual({
      status: 'loaded',
      naturalWidth: 32,
      naturalHeight: 16,
      currentSrc: IMAGE_LOAD_REQUEST.src,
    });
  });

  it('cancels pending requests on teardown and refuses new loads', async () => {
    const { host, images, createImage } = createImageHost();
    const firstResult = host.loadImage(IMAGE_LOAD_REQUEST);
    const secondResult = host.loadImage({
      ...IMAGE_LOAD_REQUEST,
      requestId: 'second-request',
    });

    host.dispose();

    await expect(firstResult).resolves.toMatchObject({ status: 'cancelled' });
    await expect(secondResult).resolves.toMatchObject({ status: 'cancelled' });
    for (const image of images) {
      expect(image.onload).toBeNull();
      expect(image.onerror).toBeNull();
      expect(image.hasAttribute('src')).toBe(false);
    }

    await expect(host.loadImage(IMAGE_LOAD_REQUEST)).resolves.toMatchObject({
      status: 'cancelled',
    });
    expect(createImage).toHaveBeenCalledTimes(2);
  });
});
