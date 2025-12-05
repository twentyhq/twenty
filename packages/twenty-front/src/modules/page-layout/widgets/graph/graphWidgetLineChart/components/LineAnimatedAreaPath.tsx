import { useMotionConfig } from '@nivo/core';
import { animated, useSpring } from '@react-spring/web';

type LineAnimatedAreaPathProps = {
  path: string;
  fillId: string;
};

export const LineAnimatedAreaPath = ({
  path,
  fillId,
}: LineAnimatedAreaPathProps) => {
  const { animate, config: motionConfig } = useMotionConfig();
  const spring = useSpring({
    d: path,
    config: motionConfig,
    immediate: !animate,
  });

  return (
    <animated.path d={spring.d} fill={`url(#${fillId})`} strokeWidth={0} />
  );
};
