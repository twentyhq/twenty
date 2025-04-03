import { useSubscription } from '@apollo/client';
import { ON_DB_EVENT } from '@/object-record/graphql/subscriptions/onDbEvent';
import { DatabaseEventAction } from '~/generated/graphql';

type OnDbEventArgs = {
  action?: DatabaseEventAction;
  objectNameSingular?: string;
  recordId?: string;
  onData: (data: any) => void;
};

export const useOnDbEvent = ({ onData, ...input }: OnDbEventArgs) => {
  useSubscription(ON_DB_EVENT, {
    variables: input,
    onData,
  });
};
