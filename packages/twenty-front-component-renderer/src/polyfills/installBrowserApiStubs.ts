// The remote-dom polyfill only implements a minimal DOM: UI libraries
// (@base-ui/react, react-responsive, ...) also probe layout and media APIs at
// render time. Install inert stubs so components mount instead of crashing;
// the sandbox has no real layout, so empty values are the honest answer.

class ObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): never[] {
    return [];
  }
}

// Inert-but-valid values: animation-aware libraries (base-ui dialogs and
// collapsibles) parse these to decide whether to wait for a transition end
// event that a layout-less sandbox would never fire.
const getStubComputedStyleValue = (property: string): string => {
  const normalizedProperty = property.toLowerCase();

  if (
    normalizedProperty.includes('duration') ||
    normalizedProperty.includes('delay')
  ) {
    return '0s';
  }

  if (
    normalizedProperty.includes('animationname') ||
    normalizedProperty.includes('animation-name') ||
    normalizedProperty.includes('transitionproperty') ||
    normalizedProperty.includes('transition-property')
  ) {
    return 'none';
  }

  return '';
};

const createEmptyComputedStyle = (): CSSStyleDeclaration =>
  new Proxy({} as CSSStyleDeclaration, {
    get: (_target, property) => {
      if (property === 'getPropertyValue') {
        return (requestedProperty: string) =>
          getStubComputedStyleValue(requestedProperty);
      }

      if (property === 'getPropertyPriority') {
        return () => '';
      }

      if (typeof property === 'string') {
        return getStubComputedStyleValue(property);
      }

      return undefined;
    },
  });

const createMatchMediaStub =
  () =>
  (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

export const installBrowserApiStubs = (): void => {
  const globalScope = globalThis as Record<string, unknown>;

  globalScope.ResizeObserver ??= ObserverStub;
  globalScope.IntersectionObserver ??= ObserverStub;
  globalScope.getComputedStyle ??= createEmptyComputedStyle;
  globalScope.matchMedia ??= createMatchMediaStub();

  const windowScope = globalScope.window as Record<string, unknown> | undefined;

  if (windowScope !== undefined && windowScope !== globalScope) {
    windowScope.ResizeObserver ??= ObserverStub;
    windowScope.IntersectionObserver ??= ObserverStub;
    windowScope.getComputedStyle ??= createEmptyComputedStyle;
    windowScope.matchMedia ??= createMatchMediaStub();
  }
};
