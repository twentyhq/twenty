import { css } from '@linaria/core';

const styles = {
  container: css`
    & {
      animation: animated-container-animatedContainerFadeIn
        calc(var(--t-animation-duration-fast) * 1s) ease;
      transition: transform calc(var(--t-animation-duration-fast) * 1s) ease;
    }
    &:hover {
      transform: scale(1.04);
    }

    @keyframes animated-container-animatedContainerFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
};

export const AnimatedContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className={styles.container}>{children}</div>;
