import { useContext } from 'react';

import { ApolloMetadataClientContext } from '../context/ApolloClientMetadataContext';

export const useApolloMetadataClient = () => {
  const apolloMetadataClient = useContext(ApolloMetadataClientContext);

  return apolloMetadataClient;
};
