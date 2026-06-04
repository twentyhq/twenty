import { Switch } from '@base-ui-components/react/switch';
import { clsx } from 'clsx';

import styles from './Toggle.module.scss';

type ToggleProps = {
  value?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
};

export const Toggle = ({
  value,
  onChange,
  disabled,
  size = 'medium',
}: ToggleProps) => (
  <Switch.Root
    checked={value}
    onCheckedChange={onChange}
    disabled={disabled}
    className={clsx(styles.root, styles[size])}
  >
    <Switch.Thumb className={styles.thumb} />
  </Switch.Root>
);
