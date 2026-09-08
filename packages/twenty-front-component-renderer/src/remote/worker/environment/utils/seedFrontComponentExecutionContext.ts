import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { getFrontComponentExecutionContext } from '@/remote/worker/environment/utils/getFrontComponentExecutionContext';
import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';

// The host posts updateContext as soon as the worker thread exists, so it
// usually lands before render; the seed carries the context the renderer
// mounted with and must never overwrite a fresher one.
export const seedFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
): void => {
  if (isDefined(getFrontComponentExecutionContext())) {
    return;
  }

  setFrontComponentExecutionContext(context);
};
