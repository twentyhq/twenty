import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { GetChatThreadsDocument } from '~/generated-metadata/graphql';

export const useRefreshAgentChatThreads = () => {
  const client = useApolloClient();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const refreshAgentChatThreads = useCallback(async () => {
    const result = await client.query({
      query: GetChatThreadsDocument,
      fetchPolicy: 'network-only',
    });

    if (!isDefined(result.data?.chatThreads)) {
      return undefined;
    }

    replaceDraft('agentChatThreads', result.data.chatThreads);
    applyChanges();

    return result.data.chatThreads;
  }, [client, replaceDraft, applyChanges]);

  return { refreshAgentChatThreads };
};
