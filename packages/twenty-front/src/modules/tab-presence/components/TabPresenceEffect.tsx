import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { TAB_PRESENCE_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

import {
  TabPresenceStatus,
  UpdateTabPresenceDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

const getCurrentTabPresenceStatus = (): TabPresenceStatus =>
  document.visibilityState === 'visible' && document.hasFocus()
    ? TabPresenceStatus.FOCUSED
    : TabPresenceStatus.OPEN;

export const TabPresenceEffect = () => {
  const [tabId] = useState(() => uuidv4());
  const [updateTabPresence] = useMutation(UpdateTabPresenceDocument);

  useEffect(() => {
    const reportTabPresence = (status: TabPresenceStatus) => {
      updateTabPresence({
        variables: { input: { tabId, status } },
        context: { fetchOptions: { keepalive: true } },
      }).catch(logError);
    };

    const reportCurrentStatus = () =>
      reportTabPresence(getCurrentTabPresenceStatus());
    const reportFocused = () => reportTabPresence(TabPresenceStatus.FOCUSED);
    const reportOpen = () => reportTabPresence(TabPresenceStatus.OPEN);

    reportCurrentStatus();

    const intervalId = setInterval(
      reportCurrentStatus,
      TAB_PRESENCE_HEARTBEAT_INTERVAL_MS,
    );

    window.addEventListener('focus', reportFocused);
    window.addEventListener('blur', reportOpen);
    document.addEventListener('visibilitychange', reportCurrentStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', reportFocused);
      window.removeEventListener('blur', reportOpen);
      document.removeEventListener('visibilitychange', reportCurrentStatus);
    };
  }, [tabId, updateTabPresence]);

  return null;
};
