import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import {
  TAB_PRESENCE_HEARTBEAT_INTERVAL_MS,
  TAB_PRESENCE_STATE,
  type TabPresenceState,
} from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

import { UPDATE_TAB_PRESENCE } from '@/tab-presence/graphql/mutations/updateTabPresence';
import { logError } from '~/utils/logError';

const getCurrentTabPresenceState = (): TabPresenceState =>
  document.visibilityState === 'visible' && document.hasFocus()
    ? TAB_PRESENCE_STATE.FOCUSED
    : TAB_PRESENCE_STATE.OPEN;

export const TabPresenceEffect = () => {
  const [tabId] = useState(() => uuidv4());
  const [updateTabPresence] = useMutation(UPDATE_TAB_PRESENCE);

  useEffect(() => {
    let isPageHidden = false;

    const reportTabPresence = (state: TabPresenceState) => {
      if (isPageHidden) {
        return;
      }

      updateTabPresence({
        variables: { input: { tabId, state } },
        context: { fetchOptions: { keepalive: true } },
      }).catch(logError);
    };

    const reportCurrentState = () =>
      reportTabPresence(getCurrentTabPresenceState());
    const reportFocused = () => reportTabPresence(TAB_PRESENCE_STATE.FOCUSED);
    const reportOpen = () => reportTabPresence(TAB_PRESENCE_STATE.OPEN);

    const reportPageHidden = () => {
      reportTabPresence(TAB_PRESENCE_STATE.CLOSED);
      isPageHidden = true;
    };

    const reportPageShown = () => {
      isPageHidden = false;
      reportCurrentState();
    };

    reportCurrentState();

    const intervalId = setInterval(
      reportCurrentState,
      TAB_PRESENCE_HEARTBEAT_INTERVAL_MS,
    );

    window.addEventListener('focus', reportFocused);
    window.addEventListener('blur', reportOpen);
    window.addEventListener('pageshow', reportPageShown);
    window.addEventListener('pagehide', reportPageHidden);
    document.addEventListener('visibilitychange', reportCurrentState);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', reportFocused);
      window.removeEventListener('blur', reportOpen);
      window.removeEventListener('pageshow', reportPageShown);
      window.removeEventListener('pagehide', reportPageHidden);
      document.removeEventListener('visibilitychange', reportCurrentState);
    };
  }, [tabId, updateTabPresence]);

  return null;
};
