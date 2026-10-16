import { Toast } from 'twenty-ui/components/feedback';
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
  return (
    <Toast
      className={styles.container}
      status="info"
      duration={6000}
      closeLabel={closeLabel}
      onClose={onClose}
    >
      <span className={styles.message}>{message}</span>
    </Toast>
  );
};
