import { createImageLoadingHost } from '../createImageLoadingHost';

const IMAGE_LOAD_REQUEST = {
  requestId: 'image-request',
  src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
  crossOrigin: 'anonymous',
  referrerPolicy: 'no-referrer',
};

const createImageHost = ({ isComplete = false } = {}) => {
  const images: HTMLImageElement[] = [];
  const sourceOptions: {
    crossOrigin: string | null;
    referrerPolicy: string;
  }[] = [];
  const createImage = jest.fn(() => {
    const image = document.createElement('img');

    Object.defineProperties(image, {
      complete: { value: isComplete },
      naturalWidth: { value: 32 },
      naturalHeight: { value: 16 },
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
    });
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
