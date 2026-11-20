import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { FOCUSED_TAB_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

import { UPDATE_FOCUSED_TAB } from '@/web-push/graphql/mutations/updateFocusedTab';
import { logError } from '~/utils/logError';

const isDocumentFocused = () =>
  document.visibilityState === 'visible' && document.hasFocus();

export const FocusedTabEffect = () => {
  const [tabId] = useState(() => uuidv4());
  const [updateFocusedTab] = useMutation(UPDATE_FOCUSED_TAB);

  useEffect(() => {
    const reportIsTabFocused = (isFocused: boolean) => {
      updateFocusedTab({
        variables: { input: { tabId, isFocused } },
        context: { fetchOptions: { keepalive: true } },
      }).catch(logError);
    };

    const reportFocus = () => reportIsTabFocused(true);
    const reportBlur = () => reportIsTabFocused(false);
    const reportVisibility = () => reportIsTabFocused(isDocumentFocused());

    reportVisibility();

    const intervalId = setInterval(() => {
      if (isDocumentFocused()) {
        reportIsTabFocused(true);
      }
    }, FOCUSED_TAB_HEARTBEAT_INTERVAL_MS);

    window.addEventListener('focus', reportFocus);
    window.addEventListener('blur', reportBlur);
    document.addEventListener('visibilitychange', reportVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', reportFocus);
      window.removeEventListener('blur', reportBlur);
      document.removeEventListener('visibilitychange', reportVisibility);
    };
  }, [tabId, updateFocusedTab]);

  return null;
};
