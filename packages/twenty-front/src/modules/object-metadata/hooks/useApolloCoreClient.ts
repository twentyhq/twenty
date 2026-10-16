import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { useApolloClient } from '@apollo/client/react';
import { useContext } from 'react';

export const useApolloCoreClient = () => {
  const apolloCoreClient = useContext(ApolloCoreClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  if (!apolloCoreClient) {
    // Error text is used for locale-independent issue grouping.
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    throw new Error('ApolloCoreClient not found');
  }

  return apolloCoreClient;
};
