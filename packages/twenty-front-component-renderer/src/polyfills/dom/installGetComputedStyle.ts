import { isDefined } from 'twenty-shared/utils';

import { createLocalStyleDeclaration } from '@/polyfills/dom/utils/createLocalStyleDeclaration';

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
    const declaredStyle =
      isDefined(element) && typeof element === 'object'
        ? (element as ElementWithStyle).style
        : undefined;

    return isDefined(declaredStyle)
      ? declaredStyle
      : createLocalStyleDeclaration();
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
    if (typeof installTarget.getComputedStyle === 'function') {
      continue;
    }

    installTarget.getComputedStyle = getComputedStyle;
  }
};
