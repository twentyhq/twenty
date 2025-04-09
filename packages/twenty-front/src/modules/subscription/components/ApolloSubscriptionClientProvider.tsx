import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { ApolloSubscriptionClientContext } from '@/subscription/contexts/ApolloClientSubscriptionContext';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const ApolloSubscriptionClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloSubscriptionClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/subscription`,
    wsUri: 'ws://localhost:3000/subscription', // use wss:// in production
  });

  return (
    <ApolloSubscriptionClientContext.Provider value={apolloSubscriptionClient}>
      {children}
    </ApolloSubscriptionClientContext.Provider>
  );
};
