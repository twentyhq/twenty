import { useApolloClient } from '@apollo/client';
import { useContext } from 'react';
import { ApolloSubscriptionClientContext } from '@/subscription/contexts/ApolloClientSubscriptionContext';

export const useApolloSubscriptionClient = () => {
  const apolloSubscriptionClient = useContext(ApolloSubscriptionClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  if (!apolloSubscriptionClient) {
    throw new Error('ApolloSubscriptionClient not found');
  }

  return apolloSubscriptionClient;
};
