import { createImagePreloaderClass } from '@/polyfills/image/utils/createImagePreloaderClass';
import { type ImageLoadRequest } from '@/types/image/ImageLoadRequest';
import { type ImageLoadResult } from '@/types/image/ImageLoadResult';

const createHarness = () => {
  const requests = new Map<string, (result: ImageLoadResult) => void>();
  const loadImage = jest.fn(
    ({ requestId }: ImageLoadRequest) =>
      new Promise<ImageLoadResult>((resolve) =>
        requests.set(requestId, resolve),
      ),
  );
  const cancelImage = jest.fn().mockResolvedValue(undefined);
  const ImagePreloader = createImagePreloaderClass({ loadImage, cancelImage });

  return {
    ImagePreloader,
    image: new ImagePreloader(),
    loadImage,
    cancelImage,
    requests,
  };
};

const flushMicrotasks = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

const LOADED_IMAGE: ImageLoadResult = {
  status: 'loaded',
  naturalWidth: 40,
  naturalHeight: 32,
  currentSrc: 'https://twenty.example/avatar.svg',
};

const BROKEN_IMAGE: ImageLoadResult = {
  status: 'error',
  naturalWidth: 0,
  naturalHeight: 0,
  currentSrc: 'https://twenty.example/broken.svg',
};

describe('createImagePreloaderClass', () => {
  it('delivers decoded dimensions and preserves image request options', async () => {
    const { image, loadImage, requests } = createHarness();
    const onload = jest.fn();

    image.onload = onload;
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
    image.src = '/avatar.svg';

    expect(image.complete).toBe(false);
    expect(image.naturalWidth).toBe(0);

    await flushMicrotasks();

    expect(loadImage).toHaveBeenCalledWith({
      requestId: '1',
      src: '/avatar.svg',
      srcset: null,
      sizes: '',
      crossOrigin: 'anonymous',
      referrerPolicy: 'no-referrer',
    });

    requests.get('1')?.(LOADED_IMAGE);
    await flushMicrotasks();

    expect(image.complete).toBe(true);
    expect(image.naturalWidth).toBe(40);
    expect(image.naturalHeight).toBe(32);
    expect(image.currentSrc).toBe(LOADED_IMAGE.currentSrc);
    expect(onload).toHaveBeenCalledTimes(1);
    expect(onload.mock.calls[0][0].type).toBe('load');
    expect(onload.mock.calls[0][0].target).toBe(image);
    expect(onload.mock.instances[0]).toBe(image);
  });

  it('sends attributes assigned in the same task as one request', async () => {
    const { image, loadImage, cancelImage } = createHarness();

    image.crossOrigin = null;
    image.sizes = '40px';
    image.srcset = '/avatar.png 1x, /avatar@2x.png 2x';
    image.src = '/avatar.png';
    await flushMicrotasks();

    expect(loadImage).toHaveBeenCalledTimes(1);
    expect(loadImage).toHaveBeenCalledWith(
      expect.objectContaining({
        src: '/avatar.png',
        srcset: '/avatar.png 1x, /avatar@2x.png 2x',
        sizes: '40px',
      }),
    );
    expect(cancelImage).not.toHaveBeenCalled();
  });

  it('loads images that only declare a srcset', async () => {
    const { image, loadImage, requests } = createHarness();
    const onload = jest.fn();

    image.onload = onload;
    image.srcset = '/avatar.png 1x';

    expect(image.complete).toBe(false);

    await flushMicrotasks();

    expect(loadImage).toHaveBeenCalledWith(
      expect.objectContaining({ src: null, srcset: '/avatar.png 1x' }),
    );

    requests.get('1')?.(LOADED_IMAGE);
    await flushMicrotasks();

    expect(onload).toHaveBeenCalledTimes(1);
  });

  it('does not request an image before a source is set', async () => {
    const { image, loadImage } = createHarness();

    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
    await flushMicrotasks();

    expect(loadImage).not.toHaveBeenCalled();
    expect(image.complete).toBe(true);
  });

  it('reports broken sources and transport failures as image errors', async () => {
    const { image, loadImage, requests } = createHarness();
    const onerror = jest.fn();

    image.onerror = onerror;
    image.src = '/broken.svg';
    await flushMicrotasks();
    requests.get('1')?.(BROKEN_IMAGE);
    await flushMicrotasks();

    expect(image.complete).toBe(true);
    expect(image.naturalWidth).toBe(0);
    expect(onerror.mock.calls[0][0].type).toBe('error');

    loadImage.mockRejectedValueOnce(new Error('Disconnected'));
    image.src = '/offline.svg';
    await flushMicrotasks();

    expect(onerror).toHaveBeenCalledTimes(2);
    expect(image.complete).toBe(true);
  });

  it('ignores an old request that completes after source replacement', async () => {
    const { image, cancelImage, requests } = createHarness();
    const onload = jest.fn();
    const onerror = jest.fn();

    image.onload = onload;
    image.onerror = onerror;
    image.src = '/old.svg';
    await flushMicrotasks();
    image.src = '/new.svg';
    await flushMicrotasks();

    expect(cancelImage).toHaveBeenCalledWith('1');

    requests.get('2')?.(LOADED_IMAGE);
    await flushMicrotasks();
    requests.get('1')?.(BROKEN_IMAGE);
    await flushMicrotasks();

    expect(image.src).toBe('/new.svg');
    expect(image.complete).toBe(true);
    expect(image.naturalWidth).toBe(40);
    expect(onload).toHaveBeenCalledTimes(1);
    expect(onerror).not.toHaveBeenCalled();
  });

  it('resets dimensions for a replacement and respects removed handlers', async () => {
    const { image, requests } = createHarness();

    image.src = '/first.svg';
    await flushMicrotasks();
    requests.get('1')?.(LOADED_IMAGE);
    await flushMicrotasks();

    const onload = jest.fn();

    image.onload = onload;
    image.src = '/second.svg';

    expect(image.complete).toBe(false);
    expect(image.naturalWidth).toBe(0);

    image.onload = null;
    await flushMicrotasks();
    requests.get('2')?.(LOADED_IMAGE);
    await flushMicrotasks();

    expect(onload).not.toHaveBeenCalled();
    expect(image.complete).toBe(true);
  });

  it('does not deliver image events for renderer cancellation', async () => {
    const { image, requests } = createHarness();
    const onload = jest.fn();
    const onerror = jest.fn();

    image.onload = onload;
    image.onerror = onerror;
    image.src = '/pending.svg';
    await flushMicrotasks();
    requests.get('1')?.({
      status: 'cancelled',
      naturalWidth: 0,
      naturalHeight: 0,
      currentSrc: '',
    });
    await flushMicrotasks();

    expect(onload).not.toHaveBeenCalled();
    expect(onerror).not.toHaveBeenCalled();
  });

  it('delivers events to listeners added with addEventListener', async () => {
    const { image, requests } = createHarness();
    const onLoad = jest.fn();

    image.addEventListener('load', onLoad);
    image.src = '/first.svg';
    await flushMicrotasks();
    requests.get('1')?.(LOADED_IMAGE);
    await flushMicrotasks();

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad.mock.calls[0][0].target).toBe(image);

    image.removeEventListener('load', onLoad);
    image.src = '/second.svg';
    await flushMicrotasks();
    requests.get('2')?.(LOADED_IMAGE);
    await flushMicrotasks();

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('keeps delivering the event when a handler throws', async () => {
    const { image, requests } = createHarness();
    const onLoad = jest.fn();

    image.onload = () => {
      throw new Error('Handler failed');
    };
    image.addEventListener('load', onLoad);
    image.src = '/avatar.svg';
    await flushMicrotasks();
    requests.get('1')?.(LOADED_IMAGE);
    await flushMicrotasks();

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(image.complete).toBe(true);
  });

  it('reflects constructor dimensions and falls back to natural dimensions', async () => {
    const { ImagePreloader, image, requests } = createHarness();
    const sizedImage = new ImagePreloader(24, 12);

    expect(sizedImage.width).toBe(24);
    expect(sizedImage.height).toBe(12);
    expect(image.width).toBe(0);

    image.src = '/avatar.svg';
    await flushMicrotasks();
    requests.get('1')?.(LOADED_IMAGE);
    await flushMicrotasks();

    expect(image.width).toBe(40);
    expect(image.height).toBe(32);

    image.width = -1;

    expect(image.width).toBe(0);
  });

  it('settles decode with the outcome of the current request', async () => {
    const { image, requests } = createHarness();

    await expect(image.decode()).rejects.toMatchObject({
      name: 'EncodingError',
    });

    image.src = '/first.svg';
    const loadedDecode = image.decode();
    await flushMicrotasks();
    requests.get('1')?.(LOADED_IMAGE);

    await expect(loadedDecode).resolves.toBeUndefined();
    await expect(image.decode()).resolves.toBeUndefined();

    image.src = '/second.svg';
    const replacedDecode = image.decode();
    image.src = '/third.svg';

    await expect(replacedDecode).rejects.toMatchObject({
      name: 'EncodingError',
    });

    const brokenDecode = image.decode();
    await flushMicrotasks();
    requests.get('3')?.(BROKEN_IMAGE);

    await expect(brokenDecode).rejects.toMatchObject({
      name: 'EncodingError',
    });
  });
});
