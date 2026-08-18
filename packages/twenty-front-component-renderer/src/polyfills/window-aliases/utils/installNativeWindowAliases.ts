import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { NATIVE_FUNCTION_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeFunctionWindowAliasNames';

export const installNativeWindowAliases = (
  globalScope: Record<string, unknown>,
): void => {
  const boundNativeFunctions: Record<string, unknown> = {};

  for (const aliasName of NATIVE_FUNCTION_WINDOW_ALIAS_NAMES) {
    const nativeFunction = globalScope[aliasName];

    if (isFunction(nativeFunction)) {
      boundNativeFunctions[aliasName] = nativeFunction.bind(globalScope);
    }
  }

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const [aliasName, boundNativeFunction] of Object.entries(
      boundNativeFunctions,
    )) {
      if (aliasName in installTarget) {
        continue;
      }

      installTarget[aliasName] = boundNativeFunction;
    }

    if (
      !('performance' in installTarget) &&
      isDefined(globalScope.performance)
    ) {
      installTarget.performance = globalScope.performance;
    }
  }
};
