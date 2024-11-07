import { ApolloMetadataClientContext } from '@/object-metadata/contexts/ApolloClientMetadataContext';
import { useApolloClient } from '@apollo/client';
import { useContext } from 'react';

export const useApolloMetadataClient = () => {
  const apolloMetadataClient = useContext(ApolloMetadataClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  if (!apolloMetadataClient) {
    throw new Error('ApolloMetadataClient not found');
  }

  return apolloMetadataClient;
};
