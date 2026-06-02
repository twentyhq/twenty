import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const ApolloAdminProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloAdminClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/admin-panel`,
  });

  return (
    <ApolloAdminClientContext.Provider value={apolloAdminClient}>
      {children}
    </ApolloAdminClientContext.Provider>
  );
};
