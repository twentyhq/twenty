import { useQuery } from '@apollo/client/react';

import { MessageTopicsDocument } from '~/generated-metadata/graphql';

export const useMessageTopics = () => {
  const { data, loading } = useQuery(MessageTopicsDocument);

  return { messageTopics: data?.messageTopics ?? [], loading };
};
