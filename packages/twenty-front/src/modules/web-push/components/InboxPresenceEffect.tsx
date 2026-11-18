import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { UPDATE_INBOX_PRESENCE } from '@/web-push/graphql/mutations/updateInboxPresence';
import { useIsWebPushAvailable } from '@/web-push/hooks/useIsWebPushAvailable';
import { logError } from '~/utils/logError';

const HEARTBEAT_INTERVAL_MS = 20_000;

const isDocumentFocused = () =>
  document.visibilityState === 'visible' && document.hasFocus();

export const InboxPresenceEffect = () => {
  const isWebPushAvailable = useIsWebPushAvailable();
  const [tabId] = useState(() => crypto.randomUUID());
  const [updateInboxPresence] = useMutation(UPDATE_INBOX_PRESENCE);

  useEffect(() => {
    if (!isWebPushAvailable) {
      return;
    }

    const reportPresence = (isFocused: boolean) => {
      updateInboxPresence({
        variables: { input: { tabId, isFocused } },
        context: { fetchOptions: { keepalive: true } },
      }).catch(logError);
    };

    const reportFocus = () => reportPresence(true);
    const reportBlur = () => reportPresence(false);
    const reportVisibility = () => reportPresence(isDocumentFocused());

    reportVisibility();

    const intervalId = setInterval(() => {
      if (isDocumentFocused()) {
        reportPresence(true);
      }
    }, HEARTBEAT_INTERVAL_MS);

    window.addEventListener('focus', reportFocus);
    window.addEventListener('blur', reportBlur);
    document.addEventListener('visibilitychange', reportVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', reportFocus);
      window.removeEventListener('blur', reportBlur);
      document.removeEventListener('visibilitychange', reportVisibility);
    };
  }, [isWebPushAvailable, tabId, updateInboxPresence]);

  return null;
};
