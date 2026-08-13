import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_CONTEXT_KEY } from 'twenty-sdk/front-component-renderer';

export const getFrontComponentColorScheme = (): 'light' | 'dark' => {
  const executionContext = (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_CONTEXT_KEY
  ] as FrontComponentExecutionContext | undefined;

  return executionContext?.colorScheme ?? 'light';
};
