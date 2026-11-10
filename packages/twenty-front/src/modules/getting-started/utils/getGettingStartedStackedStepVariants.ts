import { type GettingStartedStackTransition } from '@/getting-started/types/GettingStartedStackTransition';
import { type Variants } from 'framer-motion';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const getGettingStartedStackedStepVariants = ({
  actionKey,
  depth,
  slotOffset,
  depthScale,
}: {
  actionKey: GettingStartedStepActionKey;
  depth: number;
  slotOffset: number;
  depthScale: number;
}): Variants => {
  const getHiddenTarget = (isAtFront: boolean) =>
    isAtFront
      ? { opacity: 0, y: slotOffset * depth, scale: 1 + depthScale * depth }
      : { opacity: 0, y: -slotOffset, scale: 1 - depthScale };

  return {
    hidden: ({
      previousSelectedStepActionKey,
      isBackward,
    }: GettingStartedStackTransition) =>
      getHiddenTarget(
        isBackward && actionKey === previousSelectedStepActionKey,
      ),
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: ({
      selectedStepActionKey,
      isBackward,
    }: GettingStartedStackTransition) =>
      getHiddenTarget(!isBackward && actionKey === selectedStepActionKey),
  };
};
