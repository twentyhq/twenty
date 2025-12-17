import { createRequiredContext } from '~/utils/createRequiredContext';

type RightDrawerContextType = {
  isInRightDrawer: boolean;
};

export const [RightDrawerProvider, useIsInRightDrawerOrThrow] =
  createRequiredContext<RightDrawerContextType>('RightDrawer');
