import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { updateAppBadge } from '@/web-push/utils/updateAppBadge';
import { GetAgentChatOpenThreadsSummaryDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const InboxAppBadgeEffect = () => {
  const { data } = useQuery(GetAgentChatOpenThreadsSummaryDocument);
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
