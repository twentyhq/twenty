import { css } from '@linaria/core';
import { clsx } from 'clsx';
import { type JSX } from 'react';

import { type AnimationDuration } from 'twenty-ui/theme';

const styles = {
  container: css`
    & {
      --animated-rotate-duration: calc(var(--t-animation-duration-fast) * 1s);
      align-items: center;
      display: flex;
      justify-content: center;
      animation: animated-rotate-animatedRotateIn
        var(--animated-rotate-duration) ease;
    }
    &[data-duration='instant'] {
      --animated-rotate-duration: calc(
        var(--t-animation-duration-instant) * 1s
      );
    }
    &[data-duration='normal'] {
      --animated-rotate-duration: calc(var(--t-animation-duration-normal) * 1s);
    }
    &[data-duration='slow'] {
      --animated-rotate-duration: calc(var(--t-animation-duration-slow) * 1s);
    }

    @keyframes animated-rotate-animatedRotateIn {
      from {
        opacity: 0;
        transform: rotate(-90deg);
      }
      to {
        opacity: 1;
        transform: rotate(0deg);
      }
    }
  `,
  animateOnHover: css`
    & {
      transition: transform calc(var(--t-animation-duration-fast) * 1s) ease;
    }
    &:hover {
      transform: rotate(45deg);
    }
  `,
};

type AnimatedRotateProps = {
  children?: React.ReactNode;
  duration?: AnimationDuration;
  animateOnHover?: boolean;
};

export const AnimatedRotate = ({
  children,
  duration = 'fast',
  animateOnHover,
}: AnimatedRotateProps): JSX.Element => (
  <div
    className={clsx(styles.container, animateOnHover && styles.animateOnHover)}
    data-duration={duration}
  >
    {children}
  </div>
);
