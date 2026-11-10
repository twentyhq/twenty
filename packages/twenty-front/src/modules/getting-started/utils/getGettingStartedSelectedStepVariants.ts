import { type GettingStartedStackTransition } from '@/getting-started/types/GettingStartedStackTransition';
import { type Variants } from 'framer-motion';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const getGettingStartedSelectedStepVariants = ({
  actionKey,
  slotOffset,
  depthScale,
}: {
  actionKey: GettingStartedStepActionKey;
  slotOffset: number;
  depthScale: number;
}): Variants => {
  const frontTarget = {
    opacity: 0,
    y: slotOffset,
    scale: 1 + depthScale,
    zIndex: 1,
  };
  const getStackedTarget = (depth: number) => ({
    opacity: 0,
    y: -slotOffset * depth,
    scale: 1 - depthScale * depth,
    zIndex: 0,
  });

  return {
    hidden: ({
      previousStackedStepActionKeys,
      isBackward,
    }: GettingStartedStackTransition) =>
      isBackward
        ? frontTarget
        : getStackedTarget(
            Math.max(previousStackedStepActionKeys.indexOf(actionKey) + 1, 1),
          ),
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: ({ isBackward }: GettingStartedStackTransition) =>
      isBackward ? getStackedTarget(1) : frontTarget,
  };
};
