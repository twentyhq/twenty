import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_CONTEXT_KEY } from 'twenty-sdk/front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { reuseUnchangedExecutionContextValues } from '@/remote/worker/environment/utils/reuseUnchangedExecutionContextValues';

import { getFrontComponentExecutionContextListeners } from '@/remote/worker/environment/utils/getFrontComponentExecutionContextListeners';

export const setFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
): void => {
  const previousContext = (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_CONTEXT_KEY
  ] as FrontComponentExecutionContext | undefined;

  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY] =
    isDefined(previousContext)
      ? reuseUnchangedExecutionContextValues({
          previousExecutionContext: previousContext,
          nextExecutionContext: context,
        })
      : context;

  for (const listener of getFrontComponentExecutionContextListeners()) {
    listener();
  }
};
