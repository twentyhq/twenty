import { useContext } from 'react';

import { ApolloMetadataClientContext } from '../context/ApolloClientMetadataContext';

export const useApolloMetadataClient = () => {
  return useContext(ApolloMetadataClientContext);
};
