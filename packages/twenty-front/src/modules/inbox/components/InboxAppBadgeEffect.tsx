import { useEffect } from 'react';

import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { updateAppBadge } from '@/web-push/utils/updateAppBadge';
import { logError } from '~/utils/logError';

export const InboxAppBadgeEffect = () => {
  const { unreadOpenThreadCount, isOpenThreadsSummaryLoaded } =
    useInboxOpenThreadsSummary();

  useEffect(() => {
    if (!isOpenThreadsSummaryLoaded) {
      return;
    }

    updateAppBadge(unreadOpenThreadCount).catch(logError);
  }, [isOpenThreadsSummaryLoaded, unreadOpenThreadCount]);

  return null;
};
