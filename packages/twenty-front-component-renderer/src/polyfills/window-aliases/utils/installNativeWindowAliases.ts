import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { NATIVE_FUNCTION_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeFunctionWindowAliasNames';

export const installNativeWindowAliases = (
  globalScope: Record<string, unknown>,
): void => {
  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const aliasName of NATIVE_FUNCTION_WINDOW_ALIAS_NAMES) {
      if (aliasName in installTarget) {
        continue;
      }

      const nativeFunction = globalScope[aliasName];

      if (isFunction(nativeFunction)) {
        installTarget[aliasName] = nativeFunction.bind(globalScope);
      }
    }

    if (
      !('performance' in installTarget) &&
      isDefined(globalScope.performance)
    ) {
      installTarget.performance = globalScope.performance;
    }
  }
};
