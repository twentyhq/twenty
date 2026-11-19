import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { GetAiChatUsageDocument } from '~/generated-metadata/graphql';

export const useRefreshAiChatUsage = () => {
  const client = useApolloClient();

  const refreshAiChatUsage = useCallback(() => {
    client
      .refetchQueries({ include: [GetAiChatUsageDocument] })
      .catch(() => undefined);
  }, [client]);

  return { refreshAiChatUsage };
};
