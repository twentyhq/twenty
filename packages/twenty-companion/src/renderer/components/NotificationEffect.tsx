import { useEffect, useRef } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { doNotTranslate } from '../../shared/utils/doNotTranslate';
import { type NotificationProps } from '../types/NotificationProps';

const NOTIFICATION_DURATION_MS = 6000;
const NOTIFICATION_DEDUPE_KEY = doNotTranslate('companion-recording-finished');

export const NotificationEffect = ({
  message,
  closeLabel,
  onClose,
}: NotificationProps) => {
  const { enqueueToast, updateToast } = useToast();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const id = enqueueToast({
      dedupeKey: NOTIFICATION_DEDUPE_KEY,
      status: 'info',
      duration: NOTIFICATION_DURATION_MS,
      closeLabel,
      onClose: () => onCloseRef.current(),
      children: message,
    });
    updateToast({ id, closeLabel, children: message });
  }, [closeLabel, enqueueToast, message, updateToast]);

  return null;
};
