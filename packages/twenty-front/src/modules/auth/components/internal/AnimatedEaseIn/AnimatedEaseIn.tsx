import { css } from '@linaria/core';
import { type AnimationDuration } from 'twenty-ui/theme';

const styles = {
  fadeIn: css`
    & {
      --animated-ease-in-duration: calc(
        var(--t-animation-duration-normal) * 1s
      );
      animation: animated-ease-in-animatedEaseInFadeIn
        var(--animated-ease-in-duration) linear;
    }
    &[data-duration='instant'] {
      --animated-ease-in-duration: calc(
        var(--t-animation-duration-instant) * 1s
      );
    }
    &[data-duration='fast'] {
      --animated-ease-in-duration: calc(var(--t-animation-duration-fast) * 1s);
    }
    &[data-duration='slow'] {
      --animated-ease-in-duration: calc(var(--t-animation-duration-slow) * 1s);
    }

    @keyframes animated-ease-in-animatedEaseInFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
};

type AnimatedEaseInProps = {
  children?: React.ReactNode;
  duration?: AnimationDuration;
};

export const AnimatedEaseIn = ({
  children,
  duration = 'normal',
}: AnimatedEaseInProps) => (
  <div className={styles.fadeIn} data-duration={duration}>
    {children}
  </div>
);
