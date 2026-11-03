import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetMessageThreadChannelDocument } from '~/generated/graphql';

export const useMessageThreadChannel = (messageThreadId: string) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery(GetMessageThreadChannelDocument, {
    client: apolloCoreClient,
    variables: { messageThreadId },
  });

  return {
    messageThreadChannel: data?.getMessageThreadChannel ?? null,
    messageThreadChannelLoading: loading && !data,
  };
};
