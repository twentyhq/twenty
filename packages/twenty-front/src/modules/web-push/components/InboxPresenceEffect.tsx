import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { INBOX_PRESENCE_HEARTBEAT_INTERVAL_MS } from '@/web-push/constants/InboxPresenceHeartbeatIntervalMs';
import { UPDATE_INBOX_PRESENCE } from '@/web-push/graphql/mutations/updateInboxPresence';
import { useIsWebPushAvailable } from '@/web-push/hooks/useIsWebPushAvailable';
import { isDocumentFocused } from '@/web-push/utils/isDocumentFocused';
import { logError } from '~/utils/logError';

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

    const reportPresenceWhileFocused = () => {
      if (isDocumentFocused()) {
        reportPresence(true);
      }
    };

    reportVisibility();

    const intervalId = setInterval(
      reportPresenceWhileFocused,
      INBOX_PRESENCE_HEARTBEAT_INTERVAL_MS,
    );

    window.addEventListener('focus', reportFocus);
    window.addEventListener('blur', reportBlur);
    window.addEventListener('pagehide', reportBlur);
    document.addEventListener('visibilitychange', reportVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', reportFocus);
      window.removeEventListener('blur', reportBlur);
      window.removeEventListener('pagehide', reportBlur);
      document.removeEventListener('visibilitychange', reportVisibility);
    };
  }, [isWebPushAvailable, tabId, updateInboxPresence]);

  return null;
};
