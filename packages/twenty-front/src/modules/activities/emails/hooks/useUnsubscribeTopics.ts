import { useQuery } from '@apollo/client/react';

import { UnsubscribeTopicsDocument } from '~/generated-metadata/graphql';

export const useUnsubscribeTopics = () => {
  const { data, loading, error } = useQuery(UnsubscribeTopicsDocument);

  // error is exposed so callers can tell "this workspace has no such topic"
  // apart from "we could not ask" — the empty list looks the same either way.
  return { unsubscribeTopics: data?.unsubscribeTopics ?? [], loading, error };
};
