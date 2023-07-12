import { useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, useAnimation } from 'framer-motion';

const Bar = styled.div<Pick<ProgressBarProps, 'barHeight'>>`
  height: ${({ barHeight }) => barHeight}px;
  overflow: hidden;
  width: 100%;
`;

const BarFilling = styled(motion.div)<Pick<ProgressBarProps, 'fillColor'>>`
  background-color: ${({ theme, fillColor }) =>
    fillColor ?? theme.color.gray80};
  height: 100%;
  width: 100%;
`;

type ProgressBarProps = {
  duration?: number;
  delay?: number;
  easing?: string;
  barHeight?: number;
  fillColor?: string;
};

export function ProgressBar({
  duration = 3,
  delay = 0.5,
  easing = 'easeInOut',
  barHeight = 24,
  fillColor,
}: ProgressBarProps) {
  const controls = useAnimation();

  useEffect(() => {
    // TODO: Add a forward ref to control this from other components
    controls.start({
      scaleX: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: easing,
      },
    });
  }, [controls, delay, duration, easing]);

  return (
    <Bar barHeight={barHeight}>
      <BarFilling
        style={{ originX: 0 }}
        initial={{ scaleX: 1 }}
        animate={controls}
        exit={{ scaleX: 0 }}
        fillColor={fillColor}
      />
    </Bar>
  );
}
