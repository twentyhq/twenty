import { ADVANCED_SETTINGS_ANIMATION_DURATION } from '@/settings/constants/AdvancedSettingsAnimationDurations';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-ui';

type AnimationDimension = 'width' | 'height';

const getTransitionValues = (dimension: AnimationDimension) => ({
  transition: {
    opacity: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.opacity },
    [dimension]: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.size },
  },
});

const commonStyles = (dimension: AnimationDimension) => ({
  opacity: 0,
  [dimension]: 0,
  ...getTransitionValues(dimension),
});

const advancedSectionAnimationConfig = (
  isExpanded: boolean,
  dimension: AnimationDimension,
  measuredValue?: number,
) => ({
  initial: {
    ...commonStyles(dimension),
  },
  animate: {
    opacity: 1,
    [dimension]: isExpanded
      ? dimension === 'width'
        ? '100%'
        : measuredValue
      : 0,
    ...getTransitionValues(dimension),
  },
  exit: {
    ...commonStyles(dimension),
  },
});

export const useExpandedAnimation = (
  isExpanded: boolean,
  dimension: AnimationDimension = 'height',
) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [measuredValue, setMeasuredValue] = useState(0);

  useEffect(() => {
    if (dimension === 'height' && isDefined(contentRef.current)) {
      setMeasuredValue(contentRef.current.scrollHeight);
    }
  }, [isExpanded, dimension]);

  return {
    contentRef,
    motionAnimationVariants: advancedSectionAnimationConfig(
      isExpanded,
      dimension,
      dimension === 'height' ? measuredValue : undefined,
    ),
  };
};
