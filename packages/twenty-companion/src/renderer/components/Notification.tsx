import { useState } from 'react';
import { IconInfoCircle, IconX } from '@ui/icon';
import { IconButton } from '@ui/input/IconButton/IconButton';
import { ProgressBar } from '@ui/feedback/ProgressBar/ProgressBar';
import { useTheme } from '@ui/theme-constants';
import styles from './Notification.module.scss';

type NotificationProps = {
  message: string;
  closeLabel: string;
  onClose: () => void;
};

export const Notification = ({
  message,
  closeLabel,
  onClose,
}: NotificationProps) => {
  const theme = useTheme();
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={styles.container}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.progress}>
        <ProgressBar
          value={100}
          barColor={theme.snackBar.info.backgroundColor}
          countdownDurationInMs={6000}
          isCountdownPaused={paused}
          onCountdownComplete={onClose}
        />
      </div>
      <div className={styles.content}>
        <IconInfoCircle
          size={theme.icon.size.md}
          color={theme.snackBar.info.color}
          aria-hidden
        />
        <span className={styles.message}>{message}</span>
        <IconButton
          Icon={IconX}
          ariaLabel={closeLabel}
          onClick={onClose}
          variant="tertiary"
          size="medium"
        />
      </div>
    </div>
  );
};
