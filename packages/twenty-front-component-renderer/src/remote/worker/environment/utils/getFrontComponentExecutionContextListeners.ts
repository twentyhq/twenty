import { FRONT_COMPONENT_LISTENERS_KEY } from 'twenty-sdk/front-component-renderer';

export const getFrontComponentExecutionContextListeners = (): Set<
  () => void
> => {
  if (!(globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY]) {
    (globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY] =
      new Set<() => void>();
  }

  return (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_LISTENERS_KEY
  ] as Set<() => void>;
};
