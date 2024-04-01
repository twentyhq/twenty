import { useContext } from 'react';
import { useApolloClient } from '@apollo/client';

import { ApolloMetadataClientContext } from '../context/ApolloClientMetadataContext';

export const useApolloMetadataClient = () => {
  const apolloMetadataClient = useContext(ApolloMetadataClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  return apolloMetadataClient;
};
