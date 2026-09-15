import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';
import { NATIVE_FUNCTION_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeFunctionWindowAliasNames';
import { NATIVE_VALUE_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeValueWindowAliasNames';

export const installNativeWindowAliases = (
  globalScope: Record<string, unknown>,
): void => {
  const polyfillWindow = resolvePolyfillWindow(globalScope);

  if (!isDefined(polyfillWindow)) {
    return;
  }

  for (const aliasName of NATIVE_FUNCTION_WINDOW_ALIAS_NAMES) {
    const nativeFunction = globalScope[aliasName];

    if (aliasName in polyfillWindow || !isFunction(nativeFunction)) {
      continue;
    }

    polyfillWindow[aliasName] = nativeFunction.bind(globalScope);
  }

  for (const aliasName of NATIVE_VALUE_WINDOW_ALIAS_NAMES) {
    const nativeValue = globalScope[aliasName];

    if (aliasName in polyfillWindow || !isDefined(nativeValue)) {
      continue;
    }

    polyfillWindow[aliasName] = nativeValue;
  }
};
