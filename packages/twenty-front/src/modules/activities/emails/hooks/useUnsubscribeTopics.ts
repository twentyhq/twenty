import { useQuery } from '@apollo/client/react';

import { UNSUBSCRIBE_TOPICS } from '@/activities/emails/graphql/metadata-queries/unsubscribeTopics';
import {
  type UnsubscribeTopicsQuery,
  type UnsubscribeTopicsQueryVariables,
} from '~/generated-metadata/graphql';

export const useUnsubscribeTopics = () => {
  // Reads through the same document the topic mutations refetch, so a created
  // or deleted topic refreshes this list.
  const { data, loading } = useQuery<
    UnsubscribeTopicsQuery,
    UnsubscribeTopicsQueryVariables
  >(UNSUBSCRIBE_TOPICS);

  return { unsubscribeTopics: data?.unsubscribeTopics ?? [], loading };
};
