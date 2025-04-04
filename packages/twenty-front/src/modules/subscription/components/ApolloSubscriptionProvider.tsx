import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ApolloSubscriptionClientContext } from '@/subscription/contexts/ApolloClientSubscriptionContext';

export const ApolloSubscriptionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloSubscriptionClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/subscription`,
    connectToDevTools: false,
  });

  return (
    <ApolloSubscriptionClientContext.Provider value={apolloSubscriptionClient}>
      {children}
    </ApolloSubscriptionClientContext.Provider>
  );
};
