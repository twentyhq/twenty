import { useApolloClient, useSubscription } from '@apollo/client';
import { DatabaseEventAction } from '~/generated/graphql';
import { ON_DB_EVENT } from '@/subscription/graphql/subscriptions/onDbEvent';

type OnDbEventArgs = {
  action?: DatabaseEventAction;
  objectNameSingular?: string;
  recordId?: string;
  onData: (data: any) => void;
};

export const useOnDbEvent = ({ onData, ...input }: OnDbEventArgs) => {
  const apolloClient = useApolloClient();

  useSubscription(ON_DB_EVENT, {
    client: apolloClient,
    onData,
    variables: { input },
  });
};
