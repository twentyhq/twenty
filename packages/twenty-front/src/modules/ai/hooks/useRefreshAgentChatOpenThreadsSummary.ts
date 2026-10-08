import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { GetAgentChatOpenThreadsSummaryDocument } from '~/generated-metadata/graphql';

export const useRefreshAgentChatOpenThreadsSummary = () => {
  const client = useApolloClient();

  // Runs in the background, so a failure keeps the counts shown until the
  // next change rather than reaching the member
  const refreshAgentChatOpenThreadsSummary = useCallback(() => {
    client
      .refetchQueries({ include: [GetAgentChatOpenThreadsSummaryDocument] })
      .catch(() => undefined);
  }, [client]);

  return { refreshAgentChatOpenThreadsSummary };
};
