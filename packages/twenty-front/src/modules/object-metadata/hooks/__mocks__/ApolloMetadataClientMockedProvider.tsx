import { ReactNode } from 'react';

import { ApolloMetadataClientContext } from '@/object-metadata/contexts/ApolloClientMetadataContext';
import { mockedMetadataApolloClient } from '~/testing/mockedMetadataApolloClient';

export const ApolloMetadataClientMockedProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <ApolloMetadataClientContext.Provider value={mockedMetadataApolloClient}>
      {mockedMetadataApolloClient ? children : ''}
    </ApolloMetadataClientContext.Provider>
  );
};
