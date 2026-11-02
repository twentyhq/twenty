import { useQuery } from '@apollo/client/react';

import { GetMessageThreadChannelDocument } from '~/generated/graphql';

export const useMessageThreadChannel = (messageThreadId: string) => {
  const { data, loading } = useQuery(GetMessageThreadChannelDocument, {
    variables: { messageThreadId },
  });

  return {
    messageThreadChannel: data?.getMessageThreadChannel ?? null,
    messageThreadChannelLoading: loading && !data,
  };
};
