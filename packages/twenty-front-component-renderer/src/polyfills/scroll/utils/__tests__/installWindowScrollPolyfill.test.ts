import { isFunction } from '@sniptt/guards';

import { installWindowScrollPolyfill } from '@/polyfills/scroll/utils/installWindowScrollPolyfill';

const WINDOW_SCROLL_METHOD_NAMES = ['scrollTo', 'scroll', 'scrollBy'];

const callWindowScrollMethod = ({
  installTarget,
  methodName,
  scrollArguments,
}: {
  installTarget: Record<string, unknown>;
  methodName: string;
  scrollArguments: unknown[];
}): unknown => {
  const windowScrollMethod = installTarget[methodName];

  if (!isFunction(windowScrollMethod)) {
    throw new Error(`Expected ${methodName} to be installed`);
  }

  return Reflect.apply(windowScrollMethod, installTarget, scrollArguments);
};

describe('installWindowScrollPolyfill', () => {
  it('should install no-op scroll methods on the global scope and on a distinct polyfill window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installWindowScrollPolyfill({ globalScope });

    for (const installTarget of [globalScope, polyfillWindow]) {
      for (const methodName of WINDOW_SCROLL_METHOD_NAMES) {
        expect(
          callWindowScrollMethod({
            installTarget,
            methodName,
            scrollArguments: [0, 120],
          }),
        ).toBeUndefined();
        expect(
          callWindowScrollMethod({
            installTarget,
            methodName,
            scrollArguments: [{ top: 120, behavior: 'smooth' }],
          }),
        ).toBeUndefined();
      }
    }
  });

  it('should install the scroll methods when the window is the global scope itself', () => {
    const globalScope: Record<string, unknown> = {};
    globalScope.window = globalScope;

    installWindowScrollPolyfill({ globalScope });

    for (const methodName of WINDOW_SCROLL_METHOD_NAMES) {
      expect(
        callWindowScrollMethod({
          installTarget: globalScope,
          methodName,
          scrollArguments: [],
        }),
      ).toBeUndefined();
    }
  });

  it('should replace an existing scroll method that throws', () => {
    const notImplementedScrollTo = jest.fn(() => {
      throw new Error('Not implemented: window.scrollTo');
    });
    const globalScope: Record<string, unknown> = {
      scrollTo: notImplementedScrollTo,
    };

    installWindowScrollPolyfill({ globalScope });

    expect(
      callWindowScrollMethod({
        installTarget: globalScope,
        methodName: 'scrollTo',
        scrollArguments: [0, 120],
      }),
    ).toBeUndefined();
    expect(notImplementedScrollTo).not.toHaveBeenCalled();
  });
});
