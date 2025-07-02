import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

import { ApolloCoreClientContext } from '../contexts/ApolloCoreClientContext';

export const ApolloCoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloCoreClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/graphql`,
    connectToDevTools: true, // @Felix I am not sure if this is correct, should be false?
  });

  return (
    <ApolloCoreClientContext.Provider value={apolloCoreClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};
