import { css } from '@linaria/core';
import { clsx } from 'clsx';

const styles = {
  hint: css`
    & {
      color: var(--t-font-color-light);
      font-size: var(--t-font-size-xs);
      font-weight: var(--t-font-weight-regular);
      margin-top: var(--t-spacing-0_5);
    }
  `,
  danger: css`
    & {
      color: var(--t-font-color-danger);
    }
  `,
};

type InputHintProps = {
  children?: React.ReactNode;
  className?: string;
  danger?: boolean;
};

/**
 * @deprecated Inside `Field.Root` (from `twenty-ui/primitives/input`), use `Field.Description` for hints or `Field.Error` for errors (replaces `danger`).
 */
export const InputHint = ({ children, className, danger }: InputHintProps) => (
  <div className={clsx(styles.hint, danger && styles.danger, className)}>
    {children}
  </div>
);
