import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useInboxOpenThreadsSummaryQuery } from '@/inbox/hooks/useInboxOpenThreadsSummaryQuery';
import { updateAppBadge } from '@/web-push/utils/updateAppBadge';
import { logError } from '~/utils/logError';

export const InboxAppBadgeEffect = () => {
  const { data } = useInboxOpenThreadsSummaryQuery();
  const unreadOpenThreadCount =
    data?.agentChatOpenThreadsSummary.unreadOpenThreadCount;

  useEffect(() => {
    if (!isDefined(unreadOpenThreadCount)) {
      return;
    }

    updateAppBadge(unreadOpenThreadCount).catch(logError);
  }, [unreadOpenThreadCount]);

  return null;
};
