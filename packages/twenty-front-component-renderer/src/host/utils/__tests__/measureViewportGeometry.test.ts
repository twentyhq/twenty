import { DEFAULT_FONT_SHORTHAND } from '@/host/constants/DefaultFontShorthand';
import { measureViewportGeometry } from '../measureViewportGeometry';

describe('measureViewportGeometry', () => {
  it('should read the window fields', () => {
    const viewport = measureViewportGeometry(null);

    expect(viewport.innerWidth).toBe(window.innerWidth);
    expect(viewport.innerHeight).toBe(window.innerHeight);
    expect(viewport.devicePixelRatio).toBe(window.devicePixelRatio);
  });

  it('should return zero root fields and the default font for a null root', () => {
    const viewport = measureViewportGeometry(null);

    expect(viewport.rootContainerWidth).toBe(0);
    expect(viewport.rootContainerHeight).toBe(0);
    expect(viewport.defaultFontShorthand).toBe(DEFAULT_FONT_SHORTHAND);
  });

  it('should read the root container rect', () => {
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

    const viewport = measureViewportGeometry(rootContainer);

    expect(viewport.rootContainerX).toBe(1);
    expect(viewport.rootContainerWidth).toBe(300);
    expect(viewport.rootContainerHeight).toBe(400);
  });
});
