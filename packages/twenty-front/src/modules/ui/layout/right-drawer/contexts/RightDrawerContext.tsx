import { createRequiredContext } from '~/utils/createRequiredContext';

type RightDrawerContextType = {
  isInRightDrawer: boolean;
};

export const [RightDrawerProvider, useIsInRightDrawerOrThrow] =
  // eslint-disable-next-line lingui/no-unlocalized-strings
  createRequiredContext<RightDrawerContextType>('RightDrawer');
