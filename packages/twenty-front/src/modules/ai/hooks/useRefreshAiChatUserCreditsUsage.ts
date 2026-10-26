import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { GetAiChatUserCreditsUsageDocument } from '~/generated-metadata/graphql';

export const useRefreshAiChatUserCreditsUsage = () => {
  const client = useApolloClient();

  const refreshAiChatUserCreditsUsage = useCallback(() => {
    client
      .refetchQueries({ include: [GetAiChatUserCreditsUsageDocument] })
      .catch(() => undefined);
  }, [client]);

  return { refreshAiChatUserCreditsUsage };
};
