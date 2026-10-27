import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { InMemoryCache } from '@apollo/client';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const ApolloAdminProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloAdminClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/admin-panel`,
    cache: new InMemoryCache({
      typePolicies: {
        // isAdmin is workspace-specific, so UserInfo must not be shared by user id
        UserInfo: {
          keyFields: false,
        },
      },
    }),
  });

  return (
    <ApolloAdminClientContext.Provider value={apolloAdminClient}>
      {children}
    </ApolloAdminClientContext.Provider>
  );
};
