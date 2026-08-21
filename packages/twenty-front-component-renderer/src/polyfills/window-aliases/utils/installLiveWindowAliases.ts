import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';
import { NATIVE_FUNCTION_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeFunctionWindowAliasNames';
import { NATIVE_VALUE_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeValueWindowAliasNames';

type BoundWindowAlias = {
  nativeFunction: unknown;
  boundFunction: unknown;
};

type DefineLiveWindowAliasInput = {
  globalScope: Record<string, unknown>;
  polyfillWindow: Record<string, unknown>;
  aliasName: string;
  shouldBindToGlobalScope: boolean;
};

const defineLiveWindowAlias = ({
  globalScope,
  polyfillWindow,
  aliasName,
  shouldBindToGlobalScope,
}: DefineLiveWindowAliasInput): void => {
  // A name the remote-dom window already owns wins: a native always beats the
  // value this package would install.
  if (aliasName in polyfillWindow) {
    return;
  }

  let boundWindowAlias: BoundWindowAlias | null = null;

  Object.defineProperty(polyfillWindow, aliasName, {
    configurable: true,
    enumerable: true,
    // Resolved at access time so the alias follows a global replaced after
    // install, such as the host fetch proxy or a component's own instrumentation
    get: () => {
      const currentValue = globalScope[aliasName];

      if (!shouldBindToGlobalScope || !isFunction(currentValue)) {
        return currentValue;
      }

      // Worker natives throw when called with the remote-dom window as receiver,
      // and the bound copy is memoized so the alias keeps a stable identity for
      // as long as the underlying native does.
      if (boundWindowAlias?.nativeFunction !== currentValue) {
        boundWindowAlias = {
          nativeFunction: currentValue,
          boundFunction: currentValue.bind(globalScope),
        };
      }

      return boundWindowAlias.boundFunction;
    },
    // Natively `window.X = value` is `globalThis.X = value`
    set: (nextValue: unknown) => {
      globalScope[aliasName] = nextValue;
    },
  });
};

export const installLiveWindowAliases = (
  globalScope: Record<string, unknown>,
): void => {
  const polyfillWindow = resolvePolyfillWindow(globalScope);

  if (!isDefined(polyfillWindow)) {
    return;
  }

  for (const aliasName of NATIVE_FUNCTION_WINDOW_ALIAS_NAMES) {
    defineLiveWindowAlias({
      globalScope,
      polyfillWindow,
      aliasName,
      shouldBindToGlobalScope: true,
    });
  }

  // Aliased by reference rather than bound: these are namespaces and
  // constructors, and a bound constructor is not the same class.
  for (const aliasName of NATIVE_VALUE_WINDOW_ALIAS_NAMES) {
    defineLiveWindowAlias({
      globalScope,
      polyfillWindow,
      aliasName,
      shouldBindToGlobalScope: false,
    });
  }
};
