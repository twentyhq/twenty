import { Switch } from '@base-ui/react/switch';
import { clsx } from 'clsx';

import styles from './Toggle.module.scss';

export type ToggleSize = 'small' | 'medium';

export type ToggleProps = {
  id?: string;
  value?: boolean;
  onChange?: (value: boolean, e?: React.MouseEvent<HTMLDivElement>) => void;
  color?: string;
  toggleSize?: ToggleSize;
  className?: string;
  centered?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

export const Toggle = ({
  id,
  value = false,
  onChange,
  color,
  toggleSize = 'medium',
  className,
  centered,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ToggleProps) => (
  <Switch.Root
    id={id}
    checked={value}
    disabled={disabled}
    onCheckedChange={(checked) => onChange?.(checked)}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
    className={clsx(
      styles.root,
      styles[toggleSize],
      centered && styles.centered,
      className,
    )}
    style={
      color
        ? ({ '--toggle-on-color': color } as React.CSSProperties)
        : undefined
    }
  >
    <Switch.Thumb className={styles.thumb} />
  </Switch.Root>
);
