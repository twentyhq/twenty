import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

import { ApolloCoreClientContext } from '../contexts/ApolloCoreClientContext';

export const ApolloCoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloCoreClient = useApolloFactory();

  window.__APOLLO_CLIENT__ = apolloCoreClient;

  return (
    <ApolloCoreClientContext.Provider value={apolloCoreClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};
