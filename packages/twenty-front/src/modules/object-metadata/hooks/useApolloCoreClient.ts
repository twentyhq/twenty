import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { useApolloClient } from '@apollo/client';
import { useContext } from 'react';

export const useApolloCoreClient = () => {
  const apolloCoreClient = useContext(ApolloCoreClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  if (!apolloCoreClient) {
    throw new Error('ApolloCoreClient not found');
  }

  return apolloCoreClient;
};
