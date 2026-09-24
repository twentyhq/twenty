import { css } from '@linaria/core';
import { clsx } from 'clsx';
import { type ReactNode } from 'react';

const styles = {
  container: css`
    & {
      max-width: 100%;
      position: relative;
    }
  `,
  nodeWrapper: css`
    & {
      pointer-events: none;
      visibility: hidden;
      white-space: pre;
    }
  `,
  childWrapper: css`
    & {
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  `,
};

type AutogrowWrapperProps = {
  children: ReactNode;
  node?: ReactNode;
  className?: string;
};

export const AutogrowWrapper = ({
  children,
  node = children,
  className,
}: AutogrowWrapperProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      <span className={styles.nodeWrapper}>{node}</span>
      <div className={styles.childWrapper}>{children}</div>
    </div>
  );
};
