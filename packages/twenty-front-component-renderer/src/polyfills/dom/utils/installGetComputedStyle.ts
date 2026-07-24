import { isFunction, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ElementWithStyle } from '@/polyfills/dom/types/ElementWithStyle';
import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallGetComputedStyleInput = {
  globalScope: Record<string, unknown>;
};

export const installGetComputedStyle = ({
  globalScope,
}: InstallGetComputedStyleInput): void => {
  const getComputedStyle = (element: unknown) => {
    const declaredStyle = isObject(element)
      ? (element as ElementWithStyle).style
      : undefined;

    return isDefined(declaredStyle) ? declaredStyle : createStyleProxy();
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    if (isFunction(installTarget.getComputedStyle)) {
      continue;
    }

    installTarget.getComputedStyle = getComputedStyle;
  }
};
