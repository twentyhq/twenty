import { useQuery } from '@apollo/client/react';

import { UnsubscribeTopicsDocument } from '~/generated-metadata/graphql';

export const useUnsubscribeTopics = () => {
  const { data, loading } = useQuery(UnsubscribeTopicsDocument);

  return { unsubscribeTopics: data?.unsubscribeTopics ?? [], loading };
};
