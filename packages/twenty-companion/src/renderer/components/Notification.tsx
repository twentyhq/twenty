import { ToastProvider, Toaster } from 'twenty-ui/components/feedback';
import { NotificationEffect } from './NotificationEffect';
import { type NotificationProps } from '../types/NotificationProps';

export const Notification = ({
  message,
  closeLabel,
  onClose,
}: NotificationProps) => (
  <ToastProvider limit={1}>
    <NotificationEffect
      message={message}
      closeLabel={closeLabel}
      onClose={onClose}
    />
    <Toaster />
  </ToastProvider>
);
