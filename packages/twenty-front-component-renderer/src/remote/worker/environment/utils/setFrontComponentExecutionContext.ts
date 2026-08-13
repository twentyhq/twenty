import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_CONTEXT_KEY } from 'twenty-sdk/front-component-renderer';

import { getFrontComponentExecutionContextListeners } from '@/remote/worker/environment/utils/getFrontComponentExecutionContextListeners';

export const setFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
): void => {
  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY] =
    context;

  for (const listener of getFrontComponentExecutionContextListeners()) {
    listener();
  }
};
