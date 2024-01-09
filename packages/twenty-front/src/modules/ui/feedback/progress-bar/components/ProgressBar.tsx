import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimationControls, motion, useAnimation } from 'framer-motion';

export type ProgressBarProps = {
  duration?: number;
  delay?: number;
  easing?: string;
  barHeight?: number;
  barColor?: string;
  autoStart?: boolean;
  className?: string;
};

export type StyledBarProps = {
  barHeight?: number;
  className?: string;
};

export type ProgressBarControls = AnimationControls & {
  start: () => Promise<any>;
  pause: () => Promise<any>;
};

const StyledBar = styled.div<StyledBarProps>`
  height: ${({ barHeight }) => barHeight}px;
  overflow: hidden;
  width: 100%;
`;

const StyledBarFilling = styled(motion.div)`
  height: 100%;
  width: 100%;
`;

export const ProgressBar = forwardRef<ProgressBarControls, ProgressBarProps>(
  (
    {
      duration = 3,
      delay = 0,
      easing = 'easeInOut',
      barHeight = 24,
      barColor,
      autoStart = true,
      className,
    },
    ref,
  ) => {
    const theme = useTheme();

    const controls = useAnimation();
    // eslint-disable-next-line @nx/workspace-no-state-useref
    const startTimestamp = useRef<number>(0);
    // eslint-disable-next-line @nx/workspace-no-state-useref
    const remainingTime = useRef<number>(duration);

    const start = useCallback(async () => {
      startTimestamp.current = Date.now();
      return controls.start({
        scaleX: 0,
        transition: {
          duration: remainingTime.current / 1000, // convert ms to s for framer-motion
          delay: delay / 1000, // likewise
          ease: easing,
        },
      });
    }, [controls, delay, easing]);

    useImperativeHandle(ref, () => ({
      ...controls,
      start: async () => {
        return start();
      },
      pause: async () => {
        const elapsed = Date.now() - startTimestamp.current;

        remainingTime.current = remainingTime.current - elapsed;
        return controls.stop();
      },
    }));

    useEffect(() => {
      if (autoStart) {
        start();
      }
    }, [controls, delay, duration, easing, autoStart, start]);

    return (
      <StyledBar className={className} barHeight={barHeight}>
        <StyledBarFilling
          style={{
            originX: 0,
            // Seems like custom props are not well handled by react when used with framer-motion and emotion styled
            backgroundColor: barColor ?? theme.color.gray80,
          }}
          initial={{ scaleX: 1 }}
          animate={controls}
          exit={{ scaleX: 0 }}
        />
      </StyledBar>
    );
  },
);
