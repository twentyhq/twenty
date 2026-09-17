import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { GetChatChannelsDocument } from '~/generated-metadata/graphql';

export const useRefreshAgentChatChannels = () => {
  const client = useApolloClient();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const refreshAgentChatChannels = useCallback(async () => {
    const result = await client
      .query({ query: GetChatChannelsDocument, fetchPolicy: 'network-only' })
      .catch(() => undefined);

    const channels = result?.data?.chatChannels;
    const members = result?.data?.chatChannelMembers;

    if (!isDefined(channels) || !isDefined(members)) {
      return undefined;
    }

    replaceDraft('agentChatChannels', channels);
    replaceDraft('agentChatChannelMembers', members);
    applyChanges();

    return { channels, members };
  }, [client, replaceDraft, applyChanges]);

  return { refreshAgentChatChannels };
};
