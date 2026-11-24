import { isPrimaryPointerTouch } from '@/ai-chat/composer/utils/isPrimaryPointerTouch';

const mockMatchMedia = (matchingQuery: string | null) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({ matches: query === matchingQuery }),
  });
};

describe('isPrimaryPointerTouch', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should be true on a touch screen device', () => {
    mockMatchMedia('(pointer: coarse)');

    expect(isPrimaryPointerTouch()).toBe(true);
  });

  it('should be false with a mouse or trackpad', () => {
    mockMatchMedia('(pointer: fine)');

    expect(isPrimaryPointerTouch()).toBe(false);
  });

  it('should be false when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    expect(isPrimaryPointerTouch()).toBe(false);
  });
});
