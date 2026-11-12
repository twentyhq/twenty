import { type GettingStartedStackTransition } from '@/getting-started/types/GettingStartedStackTransition';
import { type Variants } from 'framer-motion';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const getGettingStartedSelectedStepVariants = ({
  actionKey,
  slotOffset,
  depthShrinkRatio,
}: {
  actionKey: GettingStartedStepActionKey;
  slotOffset: number;
  depthShrinkRatio: number;
}): Variants => {
  const getWidthRatio = (stackDepth: number) =>
    1 - stackDepth * depthShrinkRatio;
  const frontTarget = {
    opacity: 0,
    y: slotOffset,
    scale: 1 / getWidthRatio(1),
    zIndex: 1,
  };
  const getStackedTarget = (stackDepth: number) => ({
    opacity: 0,
    y: -slotOffset * stackDepth,
    scale: getWidthRatio(stackDepth),
    zIndex: 0,
  });

  return {
    hidden: ({
      previousStackedStepActionKeys,
      isBackward,
    }: Pick<
      GettingStartedStackTransition,
      'previousStackedStepActionKeys' | 'isBackward'
    >) =>
      isBackward
        ? frontTarget
        : getStackedTarget(
            Math.max(previousStackedStepActionKeys.indexOf(actionKey) + 1, 1),
          ),
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: ({
      isBackward,
    }: Pick<GettingStartedStackTransition, 'isBackward'>) =>
      isBackward ? getStackedTarget(1) : frontTarget,
  };
};
