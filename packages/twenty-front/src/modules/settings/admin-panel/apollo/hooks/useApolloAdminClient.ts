import { useApolloClient } from '@apollo/client/react';
import { useContext } from 'react';

import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';

export const useApolloAdminClient = () => {
  const apolloAdminClient = useContext(ApolloAdminClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  if (!apolloAdminClient) {
    throw new Error('ApolloAdminClient not found');
  }

  return apolloAdminClient;
};
