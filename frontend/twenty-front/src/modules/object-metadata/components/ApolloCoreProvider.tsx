import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';

export const ApolloCoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloCoreClient = useApolloFactory();

  return (
    <ApolloCoreClientContext.Provider value={apolloCoreClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};
