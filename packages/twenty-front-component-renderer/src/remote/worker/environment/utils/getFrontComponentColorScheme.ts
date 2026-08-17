import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_CONTEXT_KEY } from 'twenty-sdk/front-component-renderer';

const DEFAULT_COLOR_SCHEME: FrontComponentExecutionContext['colorScheme'] =
  'light';

export const getFrontComponentColorScheme =
  (): FrontComponentExecutionContext['colorScheme'] => {
    const executionContext = (globalThis as Record<string, unknown>)[
      FRONT_COMPONENT_CONTEXT_KEY
    ] as FrontComponentExecutionContext | undefined;

    return executionContext?.colorScheme ?? DEFAULT_COLOR_SCHEME;
  };
