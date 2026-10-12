import { installImageLoadingPolyfill } from '@/polyfills/image/utils/installImageLoadingPolyfill';

describe('installImageLoadingPolyfill', () => {
  it('installs one constructor on the worker and its DOM window', () => {
    const windowTarget: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: windowTarget };

    installImageLoadingPolyfill({
      globalScope,
      loadImage: jest.fn(),
      cancelImage: jest.fn(),
    });

    expect(globalScope.Image).toEqual(expect.any(Function));
    expect(windowTarget.Image).toBe(globalScope.Image);
  });

  it('preserves existing native image constructors', () => {
    const globalScope: Record<string, unknown> = { Image };

    installImageLoadingPolyfill({
      globalScope,
      loadImage: jest.fn(),
      cancelImage: jest.fn(),
    });

    expect(globalScope.Image).toBe(Image);
  });
});
