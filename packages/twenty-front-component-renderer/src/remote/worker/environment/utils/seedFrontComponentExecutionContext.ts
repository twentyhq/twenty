import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { getFrontComponentExecutionContext } from '@/remote/worker/environment/utils/getFrontComponentExecutionContext';
import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';

export const seedFrontComponentExecutionContext = (
  context: FrontComponentExecutionContext,
): void => {
  if (isDefined(getFrontComponentExecutionContext())) {
    return;
  }

  setFrontComponentExecutionContext(context);
};
