import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_LISTENERS_KEY } from 'twenty-sdk/front-component-renderer';

export const getFrontComponentExecutionContextListeners = (): Set<
  () => void
> => {
  const globalScope = globalThis as Record<string, unknown>;

  if (!isDefined(globalScope[FRONT_COMPONENT_LISTENERS_KEY])) {
    globalScope[FRONT_COMPONENT_LISTENERS_KEY] = new Set<() => void>();
  }

  return globalScope[FRONT_COMPONENT_LISTENERS_KEY] as Set<() => void>;
};
