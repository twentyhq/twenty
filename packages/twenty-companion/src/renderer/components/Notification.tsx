import { Toast } from '@ui/components/feedback/Toast/Toast';
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
}: NotificationProps) => (
  <Toast
    className={styles.container}
    variant="info"
    duration={6000}
    closeLabel={closeLabel}
    onClose={onClose}
  >
    {message}
  </Toast>
);
