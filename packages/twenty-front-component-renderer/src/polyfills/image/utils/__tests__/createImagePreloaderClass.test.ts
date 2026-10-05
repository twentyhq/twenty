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

  return { image: new ImagePreloader(), loadImage, cancelImage, requests };
};

const LOADED_IMAGE: ImageLoadResult = {
  status: 'loaded',
  naturalWidth: 40,
  naturalHeight: 32,
};

const BROKEN_IMAGE: ImageLoadResult = {
  status: 'error',
  naturalWidth: 0,
  naturalHeight: 0,
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
    expect(loadImage).toHaveBeenCalledWith({
      requestId: '1',
      src: '/avatar.svg',
      crossOrigin: 'anonymous',
      referrerPolicy: 'no-referrer',
    });

    requests.get('1')?.(LOADED_IMAGE);
    await Promise.resolve();

    expect(image.complete).toBe(true);
    expect(image.naturalWidth).toBe(40);
    expect(image.naturalHeight).toBe(32);
    expect(onload).toHaveBeenCalledTimes(1);
    expect(onload.mock.calls[0][0].type).toBe('load');
    expect(onload.mock.instances[0]).toBe(image);
  });

  it('reports broken sources and transport failures as image errors', async () => {
    const { image, loadImage, requests } = createHarness();
    const onerror = jest.fn();
    image.onerror = onerror;
    image.src = '/broken.svg';
    requests.get('1')?.(BROKEN_IMAGE);
    await Promise.resolve();

    expect(image.complete).toBe(true);
    expect(image.naturalWidth).toBe(0);
    expect(onerror.mock.calls[0][0].type).toBe('error');

    loadImage.mockRejectedValueOnce(new Error('Disconnected'));
    image.src = '/offline.svg';
    await Promise.resolve();

    expect(onerror).toHaveBeenCalledTimes(2);
    expect(image.complete).toBe(true);
  });

  it('ignores an old request that completes after source replacement', async () => {
    const { image, cancelImage, requests } = createHarness();
    image.onload = jest.fn();
    image.onerror = jest.fn();
    image.src = '/old.svg';
    image.src = '/new.svg';

    expect(cancelImage).toHaveBeenCalledWith('1');
    requests.get('2')?.(LOADED_IMAGE);
    await Promise.resolve();
    requests.get('1')?.(BROKEN_IMAGE);
    await Promise.resolve();

    expect(image.src).toBe('/new.svg');
    expect(image.complete).toBe(true);
    expect(image.naturalWidth).toBe(40);
    expect(image.onload).toHaveBeenCalledTimes(1);
    expect(image.onerror).not.toHaveBeenCalled();
  });

  it('resets dimensions for a replacement and respects removed handlers', async () => {
    const { image, requests } = createHarness();
    image.src = '/first.svg';
    requests.get('1')?.(LOADED_IMAGE);
    await Promise.resolve();

    const onload = jest.fn();
    image.onload = onload;
    image.src = '/second.svg';
    expect(image.complete).toBe(false);
    expect(image.naturalWidth).toBe(0);
    image.onload = null;
    requests.get('2')?.(LOADED_IMAGE);
    await Promise.resolve();

    expect(onload).not.toHaveBeenCalled();
    expect(image.complete).toBe(true);
  });

  it('does not deliver image events for renderer cancellation', async () => {
    const { image, requests } = createHarness();
    image.onload = jest.fn();
    image.onerror = jest.fn();
    image.src = '/pending.svg';
    requests.get('1')?.({
      status: 'cancelled',
      naturalWidth: 0,
      naturalHeight: 0,
    });
    await Promise.resolve();

    expect(image.onload).not.toHaveBeenCalled();
    expect(image.onerror).not.toHaveBeenCalled();
  });
});
