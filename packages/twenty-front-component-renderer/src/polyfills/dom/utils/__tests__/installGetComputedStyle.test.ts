import { installGetComputedStyle } from '../installGetComputedStyle';

type StyleDeclarationLike = {
  getPropertyValue: (propertyName: string) => string;
  fontSize?: unknown;
};

type GetComputedStyleLike = (
  element: unknown,
  pseudoElement?: unknown,
) => StyleDeclarationLike;

describe('installGetComputedStyle', () => {
  it('should define getComputedStyle on both the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installGetComputedStyle({ globalScope });

    expect(typeof globalScope.getComputedStyle).toBe('function');
    expect(typeof polyfillWindow.getComputedStyle).toBe('function');
  });

  it('should return the declared style of the element', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({ globalScope });

    const style = { getPropertyValue: () => '14px', fontSize: '14px' };

    expect(
      (globalScope.getComputedStyle as GetComputedStyleLike)({ style })
        .fontSize,
    ).toBe('14px');
  });

  it('should return an empty declaration for an element without a style', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({ globalScope });

    const declaration = (globalScope.getComputedStyle as GetComputedStyleLike)(
      {},
    );

    expect(declaration.getPropertyValue('font-size')).toBe('');
    expect(declaration.fontSize).toBe('');
  });

  it('should return an empty declaration for a pseudo-element argument', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({ globalScope });

    const style = { getPropertyValue: () => '14px', fontSize: '14px' };

    const declaration = (globalScope.getComputedStyle as GetComputedStyleLike)(
      { style },
      '::before',
    );

    expect(declaration.getPropertyValue('font-size')).toBe('');
    expect(declaration.fontSize).toBe('');
  });

  it('should not override an existing getComputedStyle', () => {
    const existingGetComputedStyle = jest.fn();
    const globalScope: Record<string, unknown> = {
      getComputedStyle: existingGetComputedStyle,
    };

    installGetComputedStyle({ globalScope });

    expect(globalScope.getComputedStyle).toBe(existingGetComputedStyle);
  });
});
