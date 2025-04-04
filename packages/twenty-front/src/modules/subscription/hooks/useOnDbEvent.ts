import { useSubscription } from '@apollo/client';
import { DatabaseEventAction } from '~/generated/graphql';
import { ON_DB_EVENT } from '@/subscription/graphql/subscriptions/onDbEvent';
import { useApolloSubscriptionClient } from '@/subscription/hooks/useApolloSubscriptionClient';

type OnDbEventArgs = {
  action?: DatabaseEventAction;
  objectNameSingular?: string;
  recordId?: string;
  onData: (data: any) => void;
};

export const useOnDbEvent = ({ onData, ...input }: OnDbEventArgs) => {
  const apolloSubscriptionClient = useApolloSubscriptionClient();

  useSubscription(ON_DB_EVENT, {
    variables: { input },
    onData,
    client: apolloSubscriptionClient,
  });
};
