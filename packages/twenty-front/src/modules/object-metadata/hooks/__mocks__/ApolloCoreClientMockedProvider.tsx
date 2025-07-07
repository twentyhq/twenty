import { ReactNode } from 'react';

import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { mockedApolloCoreClient } from '~/testing/mockedApolloCoreClient';

export const ApolloCoreClientMockedProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <ApolloCoreClientContext.Provider value={mockedApolloCoreClient}>
      {mockedApolloCoreClient ? children : ''}
    </ApolloCoreClientContext.Provider>
  );
};
