import { css } from '@linaria/core';
import { clsx } from 'clsx';

const styles = {
  label: css`
    & {
      color: var(--t-font-color-light);
      display: block;
      font-size: 11px;
      font-weight: var(--t-font-weight-semi-bold);
      margin-bottom: var(--t-spacing-1);
    }
  `,
};

type InputLabelProps = {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

/**
 * @deprecated Compose `Field.Label` inside `Field.Root` (from `twenty-ui/primitives/input`) instead.
 */
export const InputLabel = ({
  children,
  className,
  htmlFor,
}: InputLabelProps) => (
  <label className={clsx(styles.label, className)} htmlFor={htmlFor}>
    {children}
  </label>
);
