import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { GetAgentChatOpenThreadsSummaryDocument } from '~/generated-metadata/graphql';

export const useRefreshInboxOpenThreadsSummary = () => {
  const client = useApolloClient();

  const refreshInboxOpenThreadsSummary = useCallback(() => {
    client
      .refetchQueries({ include: [GetAgentChatOpenThreadsSummaryDocument] })
      .catch(() => undefined);
  }, [client]);

  return { refreshInboxOpenThreadsSummary };
};
