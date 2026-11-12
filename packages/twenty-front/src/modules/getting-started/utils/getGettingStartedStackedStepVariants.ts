import { type GettingStartedStackTransition } from '@/getting-started/types/GettingStartedStackTransition';
import { type Variants } from 'framer-motion';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const getGettingStartedStackedStepVariants = ({
  actionKey,
  depth,
  slotOffset,
  depthShrinkRatio,
}: {
  actionKey: GettingStartedStepActionKey;
  depth: number;
  slotOffset: number;
  depthShrinkRatio: number;
}): Variants => {
  const getWidthRatio = (stackDepth: number) =>
    1 - stackDepth * depthShrinkRatio;
  const getHiddenTarget = (isAtFront: boolean) =>
    isAtFront
      ? { opacity: 0, y: slotOffset * depth, scale: 1 / getWidthRatio(depth) }
      : {
          opacity: 0,
          y: -slotOffset,
          scale: getWidthRatio(depth + 1) / getWidthRatio(depth),
        };

  return {
    hidden: ({
      previousSelectedStepActionKey,
      isBackward,
    }: Pick<
      GettingStartedStackTransition,
      'previousSelectedStepActionKey' | 'isBackward'
    >) =>
      getHiddenTarget(
        isBackward && actionKey === previousSelectedStepActionKey,
      ),
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: ({
      selectedStepActionKey,
      isBackward,
    }: Pick<
      GettingStartedStackTransition,
      'selectedStepActionKey' | 'isBackward'
    >) => getHiddenTarget(!isBackward && actionKey === selectedStepActionKey),
  };
};
