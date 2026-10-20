import { useEffect, useRef } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { isDefined } from 'twenty-ui/utilities';
import { doNotTranslate } from '../../shared/utils/doNotTranslate';
import { type NotificationProps } from '../types/NotificationProps';

const NOTIFICATION_DURATION_MS = 6000;
const NOTIFICATION_DEDUPE_KEY = doNotTranslate('companion-recording-finished');

export const NotificationEffect = ({
  message,
  closeLabel,
  onClose,
}: NotificationProps) => {
  const { enqueueToast, closeToast, updateToast } = useToast();
  const onCloseRef = useRef<(() => void) | undefined>(onClose);
  const toastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    onCloseRef.current = isDefined(message) ? onClose : undefined;
  }, [message, onClose]);

  useEffect(() => {
    if (!isDefined(message)) {
      return;
    }

    const id = enqueueToast({
      dedupeKey: NOTIFICATION_DEDUPE_KEY,
      status: 'info',
      duration: NOTIFICATION_DURATION_MS,
      closeLabel,
      onClose: () => {
        toastIdRef.current = undefined;
        onCloseRef.current?.();
      },
      children: message,
    });
    toastIdRef.current = id;
    updateToast({ id, closeLabel, children: message });
  }, [closeLabel, enqueueToast, message, updateToast]);

  useEffect(() => {
    if (isDefined(message) || !isDefined(toastIdRef.current)) {
      return;
    }

    const id = toastIdRef.current;
    toastIdRef.current = undefined;
    updateToast({ id, onClose: undefined });
    closeToast(id);
  }, [closeToast, message, updateToast]);

  return null;
};
