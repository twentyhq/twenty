import { isFunction, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';

type ElementWithStyle = {
  style?: unknown;
};

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

  const installTargets: Record<string, unknown>[] = [globalScope];
  const polyfillWindow = globalScope.window;

  if (
    isDefined(polyfillWindow) &&
    typeof polyfillWindow === 'object' &&
    polyfillWindow !== globalScope
  ) {
    installTargets.push(polyfillWindow as Record<string, unknown>);
  }

  for (const installTarget of installTargets) {
    if (isFunction(installTarget.getComputedStyle)) {
      continue;
    }

    installTarget.getComputedStyle = getComputedStyle;
  }
};
