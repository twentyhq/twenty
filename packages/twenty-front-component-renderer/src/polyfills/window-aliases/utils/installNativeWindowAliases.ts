import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { NATIVE_FUNCTION_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeFunctionWindowAliasNames';
import { NATIVE_VALUE_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeValueWindowAliasNames';

export const installNativeWindowAliases = (
  globalScope: Record<string, unknown>,
): void => {
  const nativeAliases: Record<string, unknown> = {};

  for (const aliasName of NATIVE_FUNCTION_WINDOW_ALIAS_NAMES) {
    const nativeFunction = globalScope[aliasName];

    if (isFunction(nativeFunction)) {
      nativeAliases[aliasName] = nativeFunction.bind(globalScope);
    }
  }

  for (const aliasName of NATIVE_VALUE_WINDOW_ALIAS_NAMES) {
    const nativeValue = globalScope[aliasName];

    if (isDefined(nativeValue)) {
      nativeAliases[aliasName] = nativeValue;
    }
  }

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const [aliasName, nativeAlias] of Object.entries(nativeAliases)) {
      if (aliasName in installTarget) {
        continue;
      }

      installTarget[aliasName] = nativeAlias;
    }
  }
};
