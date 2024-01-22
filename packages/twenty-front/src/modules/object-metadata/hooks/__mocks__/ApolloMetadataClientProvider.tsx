import { ReactNode } from 'react';
import {
  ApolloClient,
  NormalizedCacheObject,
  useApolloClient,
} from '@apollo/client';

import { ApolloMetadataClientContext } from '@/object-metadata/context/ApolloClientMetadataContext';

export const TestApolloMetadataClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const client = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  return (
    <ApolloMetadataClientContext.Provider value={client}>
      {client ? children : ''}
    </ApolloMetadataClientContext.Provider>
  );
};
