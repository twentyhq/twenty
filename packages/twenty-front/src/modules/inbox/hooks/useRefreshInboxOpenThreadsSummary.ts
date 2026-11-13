import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { GetAgentChatOpenThreadsSummaryDocument } from '~/generated-metadata/graphql';

export const useRefreshInboxOpenThreadsSummary = () => {
  const client = useApolloClient();

  // Runs in the background, so a failure keeps the counts shown until the
  // next change rather than reaching the member
  const refreshInboxOpenThreadsSummary = useCallback(() => {
    client
      .refetchQueries({ include: [GetAgentChatOpenThreadsSummaryDocument] })
      .catch(() => undefined);
  }, [client]);

  return { refreshInboxOpenThreadsSummary };
};
