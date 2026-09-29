import { useQuery } from '@apollo/client/react';

import { DISCOVER_MESSAGE } from '@/activities/timeline-activities/rows/message/graphql/queries/discoverMessage';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

// A message that is not shared with the reader still exists for them: they
// can discover it, while a deleted one cannot be found at all.
export const useIsMessageDiscoverable = ({
  messageId,
  skip,
}: {
  messageId: string;
  skip: boolean;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery<{
    messages: { edges: { node: { id: string } }[] };
  }>(DISCOVER_MESSAGE, {
    skip,
    variables: { messageId },
    client: apolloCoreClient,
  });

  return {
    isMessageDiscoverable: (data?.messages.edges.length ?? 0) > 0,
    loading,
  };
};
