import { ReactNode } from 'react';

import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { mockedMetadataApolloClient } from '~/testing/mockedMetadataApolloClient';

export const ApolloCoreClientMockedProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <ApolloCoreClientContext.Provider value={mockedMetadataApolloClient}>
      {mockedMetadataApolloClient ? children : ''}
    </ApolloCoreClientContext.Provider>
  );
};
