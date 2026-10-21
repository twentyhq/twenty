import { isFunction } from '@sniptt/guards';

import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';
import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';
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

    installGetComputedStyle({
      globalScope,
      geometryStore: createWorkerGeometryStoreStub(),
    });

    expect(typeof globalScope.getComputedStyle).toBe('function');
    expect(typeof polyfillWindow.getComputedStyle).toBe('function');
  });

  it('should return the declared style of the element', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({
      globalScope,
      geometryStore: createWorkerGeometryStoreStub(),
    });

    const style = { getPropertyValue: () => '14px', fontSize: '14px' };

    expect(
      (globalScope.getComputedStyle as GetComputedStyleLike)({ style })
        .fontSize,
    ).toBe('14px');
  });

  it('reads declared values from the renderer style proxy before measurement', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({
      globalScope,
      geometryStore: createWorkerGeometryStoreStub(),
    });
    const declaredStyle = createStyleProxy(() => {});
    declaredStyle.setProperty('font-size', '14px');

    const getComputedStyle = globalScope.getComputedStyle;
    if (!isFunction<GetComputedStyleLike, unknown>(getComputedStyle)) {
      throw new Error('getComputedStyle was not installed');
    }
    const computedStyle = getComputedStyle({ style: declaredStyle });

    expect(computedStyle.fontSize).toBe('14px');
  });

  it('should return an empty declaration for an element without a style', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({
      globalScope,
      geometryStore: createWorkerGeometryStoreStub(),
    });

    const declaration = (globalScope.getComputedStyle as GetComputedStyleLike)(
      {},
    );

    expect(declaration.getPropertyValue('font-size')).toBe('');
    expect(declaration.fontSize).toBe('');
  });

  it('should return an empty declaration for a pseudo-element argument', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({
      globalScope,
      geometryStore: createWorkerGeometryStoreStub(),
    });

    const style = { getPropertyValue: () => '14px', fontSize: '14px' };

    const declaration = (globalScope.getComputedStyle as GetComputedStyleLike)(
      { style },
      '::before',
    );

    expect(declaration.getPropertyValue('font-size')).toBe('');
    expect(declaration.fontSize).toBe('');
  });
  it('should read measured values of an observed element through the same declaration without enrolling it', () => {
    const globalScope: Record<string, unknown> = {};
    let columnGap = '12px';
    const geometryStore = createWorkerGeometryStoreStub({
      readObservedElementSnapshot: () =>
        createElementGeometrySnapshotFixture({
          computedStyle: { 'column-gap': columnGap, display: 'flex' },
        }),
    });
    installGetComputedStyle({ globalScope, geometryStore });
    const style = (globalScope.getComputedStyle as GetComputedStyleLike)({
      style: { getPropertyValue: () => '99px' },
    });

    expect(style.getPropertyValue('Column-Gap')).toBe('12px');
    columnGap = '24px';
    expect(style.getPropertyValue('column-gap')).toBe('24px');
    expect(style.getPropertyValue('transition-duration')).toBe('99px');
    expect(geometryStore.resolveElementSnapshot).not.toHaveBeenCalled();
  });

  it('should fall back to the declared style for an element that is not measured', () => {
    const globalScope: Record<string, unknown> = {};
    const geometryStore = createWorkerGeometryStoreStub();
    installGetComputedStyle({ globalScope, geometryStore });
    const declaredStyle = createStyleProxy(() => {});
    declaredStyle.setProperty('display', 'grid');

    const style = (globalScope.getComputedStyle as GetComputedStyleLike)({
      style: declaredStyle,
    });

    expect(style.getPropertyValue('display')).toBe('grid');
    expect(geometryStore.resolveElementSnapshot).not.toHaveBeenCalled();
  });

  it('should enroll a container whose child element is already measured', () => {
    const globalScope: Record<string, unknown> = {};
    const measuredChild = { nodeType: 1 };
    const container = {
      childNodes: [{ nodeType: 3 }, measuredChild],
      style: { getPropertyValue: () => '0px' },
    };
    const geometryStore = createWorkerGeometryStoreStub({
      isElementMeasured: jest.fn((element) => element === measuredChild),
      resolveElementSnapshot: jest.fn(() =>
        createElementGeometrySnapshotFixture({
          computedStyle: { 'column-gap': '4px' },
        }),
      ),
    });
    installGetComputedStyle({ globalScope, geometryStore });

    const style = (globalScope.getComputedStyle as GetComputedStyleLike)(
      container,
    );

    expect(style.getPropertyValue('column-gap')).toBe('4px');
    expect(geometryStore.resolveElementSnapshot).toHaveBeenCalledWith(
      container,
    );
  });

  it('should keep Object.prototype members callable on the declaration', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({
      globalScope,
      geometryStore: createWorkerGeometryStoreStub(),
    });

    const style = (globalScope.getComputedStyle as GetComputedStyleLike)({
      style: createStyleProxy(() => {}),
    });

    expect(() => `${style}`).not.toThrow();
    expect(style.hasOwnProperty('display')).toBe(false);
    expect(style.getPropertyValue('constructor')).toBe('');
  });

  it('should not read inherited members of a measured style as property values', () => {
    const globalScope: Record<string, unknown> = {};
    installGetComputedStyle({
      globalScope,
      geometryStore: createWorkerGeometryStoreStub({
        readObservedElementSnapshot: () =>
          createElementGeometrySnapshotFixture({
            computedStyle: { display: 'flex' },
          }),
      }),
    });

    const style = (globalScope.getComputedStyle as GetComputedStyleLike)({
      style: createStyleProxy(() => {}),
    });

    expect(style.getPropertyValue('display')).toBe('flex');
    expect(style.getPropertyValue('constructor')).toBe('');
    expect(style.getPropertyValue('__proto__')).toBe('');
  });
});
