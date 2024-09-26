import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-ui';

const advancedSectionAnimationConfig = (
  isExpanded: boolean,
  measuredHeight: number,
) => ({
  initial: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.4 },
    },
  },
  animate: {
    opacity: 1,
    height: isExpanded ? measuredHeight : 0,
    overflow: 'hidden',
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.4 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.4 },
    },
  },
});
export const useExpandedHeightAnimation = (isExpanded: boolean) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (isDefined(contentRef.current)) {
      setMeasuredHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  return {
    contentRef,
    measuredHeight,
    motionAnimationVariants: advancedSectionAnimationConfig(
      isExpanded,
      measuredHeight,
    ),
  };
};
