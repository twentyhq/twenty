import { css } from '@linaria/core';

const styles = {
  container: css`
    & {
      align-items: center;
      animation: animated-circle-loading-animatedCircleLoadingSpin
        calc(var(--t-animation-duration-slow) * 1s) ease-in-out infinite;
      display: flex;
      justify-content: center;
    }

    @keyframes animated-circle-loading-animatedCircleLoadingSpin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
};

export const AnimatedCircleLoading = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className={styles.container}>{children}</div>;
