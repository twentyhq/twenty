import { DEFAULT_FONT_SHORTHAND } from '@/constants/DefaultFontShorthand';
import { measureViewportGeometry } from '../measureViewportGeometry';

describe('measureViewportGeometry', () => {
  it('should read the window fields', () => {
    const viewport = measureViewportGeometry(null, DEFAULT_FONT_SHORTHAND);

    expect(viewport.innerWidth).toBe(window.innerWidth);
    expect(viewport.innerHeight).toBe(window.innerHeight);
    expect(viewport.devicePixelRatio).toBe(window.devicePixelRatio);
    expect(viewport.scrollX).toBe(window.scrollX);
    expect(viewport.scrollY).toBe(window.scrollY);
  });

  it('should return zero root fields for a null root', () => {
    const viewport = measureViewportGeometry(null, DEFAULT_FONT_SHORTHAND);

    expect(viewport.rootContainerWidth).toBe(0);
    expect(viewport.rootContainerHeight).toBe(0);
    expect(viewport.rootContainerClientWidth).toBe(0);
    expect(viewport.rootContainerClientHeight).toBe(0);
  });

  it('should pass the supplied font shorthand through', () => {
    const viewport = measureViewportGeometry(null, '700 20px Inter');

    expect(viewport.defaultFontShorthand).toBe('700 20px Inter');
  });

  it('should not read computed styles', () => {
    const getComputedStyle = jest.spyOn(window, 'getComputedStyle');
    const rootContainer = document.createElement('div');

    measureViewportGeometry(rootContainer, DEFAULT_FONT_SHORTHAND);

    expect(getComputedStyle).not.toHaveBeenCalled();
    getComputedStyle.mockRestore();
  });

  it('should read the root container rect and client sizes', () => {
    const rootContainer = document.createElement('div');
    rootContainer.getBoundingClientRect = () =>
      ({
        x: 1,
        y: 2,
        width: 300,
        height: 400,
        top: 2,
        left: 1,
        right: 301,
        bottom: 402,
        toJSON: () => ({}),
      }) as DOMRect;
    Object.defineProperty(rootContainer, 'clientWidth', { value: 290 });
    Object.defineProperty(rootContainer, 'clientHeight', { value: 390 });

    const viewport = measureViewportGeometry(
      rootContainer,
      DEFAULT_FONT_SHORTHAND,
    );

    expect(viewport.rootContainerX).toBe(1);
    expect(viewport.rootContainerY).toBe(2);
    expect(viewport.rootContainerWidth).toBe(300);
    expect(viewport.rootContainerHeight).toBe(400);
    expect(viewport.rootContainerClientWidth).toBe(290);
    expect(viewport.rootContainerClientHeight).toBe(390);
  });
});
