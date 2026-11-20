import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import {
  TAB_PRESENCE_HEARTBEAT_INTERVAL_MS,
  TAB_PRESENCE_STATUS,
  type TabPresenceStatus,
} from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

import { UpdateTabPresenceDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

const getCurrentTabPresenceStatus = (): TabPresenceStatus =>
  document.visibilityState === 'visible' && document.hasFocus()
    ? TAB_PRESENCE_STATUS.FOCUSED
    : TAB_PRESENCE_STATUS.OPEN;

export const TabPresenceEffect = () => {
  const [tabId] = useState(() => uuidv4());
  const [updateTabPresence] = useMutation(UpdateTabPresenceDocument);

  useEffect(() => {
    let isPageHidden = false;

    const reportTabPresence = (status: TabPresenceStatus) => {
      if (isPageHidden) {
        return;
      }

      updateTabPresence({
        variables: { input: { tabId, status } },
        context: { fetchOptions: { keepalive: true } },
      }).catch(logError);
    };

    const reportCurrentStatus = () =>
      reportTabPresence(getCurrentTabPresenceStatus());
    const reportFocused = () => reportTabPresence(TAB_PRESENCE_STATUS.FOCUSED);
    const reportOpen = () => reportTabPresence(TAB_PRESENCE_STATUS.OPEN);

    const reportPageHidden = () => {
      reportTabPresence(TAB_PRESENCE_STATUS.CLOSED);
      isPageHidden = true;
    };

    const reportPageShown = () => {
      isPageHidden = false;
      reportCurrentStatus();
    };

    reportCurrentStatus();

    const intervalId = setInterval(
      reportCurrentStatus,
      TAB_PRESENCE_HEARTBEAT_INTERVAL_MS,
    );

    window.addEventListener('focus', reportFocused);
    window.addEventListener('blur', reportOpen);
    window.addEventListener('pageshow', reportPageShown);
    window.addEventListener('pagehide', reportPageHidden);
    document.addEventListener('visibilitychange', reportCurrentStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', reportFocused);
      window.removeEventListener('blur', reportOpen);
      window.removeEventListener('pageshow', reportPageShown);
      window.removeEventListener('pagehide', reportPageHidden);
      document.removeEventListener('visibilitychange', reportCurrentStatus);
    };
  }, [tabId, updateTabPresence]);

  return null;
};
