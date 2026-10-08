import { stubWindowMatchMedia } from '@/testing/stubWindowMatchMedia';
import { readInputMediaFeatures } from '../readInputMediaFeatures';

describe('readInputMediaFeatures', () => {
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('should report no hover and no pointer where matchMedia is unavailable', () => {
    expect(readInputMediaFeatures()).toEqual({
      hover: 'none',
      pointer: 'none',
    });
  });

  it('should report a mouse as a fine pointer that hovers', () => {
    stubWindowMatchMedia(['(hover: hover)', '(pointer: fine)']);

    expect(readInputMediaFeatures()).toEqual({
      hover: 'hover',
      pointer: 'fine',
    });
  });

  it('should report a touch screen as a coarse pointer that cannot hover', () => {
    stubWindowMatchMedia(['(pointer: coarse)']);

    expect(readInputMediaFeatures()).toEqual({
      hover: 'none',
      pointer: 'coarse',
    });
  });
});
