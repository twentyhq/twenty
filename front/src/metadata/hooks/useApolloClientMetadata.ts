import { useContext } from 'react';

import { ApolloClientMetadataContext } from '../context/ApolloClientMetadataContext';

export const useApolloClientMetadata = () => {
  return useContext(ApolloClientMetadataContext);
};
