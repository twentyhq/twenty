import { useQuery } from '@apollo/client/react';

import { GetMessageThreadChannelDocument } from '~/generated/graphql';

export const useMessageThreadChannel = (
  messageThreadId: string,
  { skip = false }: { skip?: boolean } = {},
) => {
  const { data, loading } = useQuery(GetMessageThreadChannelDocument, {
    variables: { messageThreadId },
    skip,
  });

  return {
    messageThreadChannel: data?.getMessageThreadChannel ?? null,
    messageThreadChannelLoading: loading && !data,
  };
};
