import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetMessageThreadChannelDocument } from '~/generated/graphql';

export const useMessageThreadChannel = (
  messageThreadId: string,
  { skip = false }: { skip?: boolean } = {},
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery(GetMessageThreadChannelDocument, {
    client: apolloCoreClient,
    variables: { messageThreadId },
    skip,
  });

  return {
    messageThreadChannel: data?.getMessageThreadChannel ?? null,
    messageThreadChannelLoading: loading && !data,
  };
};
