import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { useApolloClient } from '@apollo/client';
import { DatabaseEventAction } from '~/generated/graphql';
import { capitalize } from 'twenty-shared/utils';

type ListenUpdatesArgs = {
  objectNameSingular: string;
  recordId: string;
  listenedFields: string[];
};

export const useListenUpdates = ({
  objectNameSingular,
  recordId,
  listenedFields,
}: ListenUpdatesArgs) => {
  const apolloClient = useApolloClient();

  useOnDbEvent({
    input: { recordId, action: DatabaseEventAction.UPDATED },
    onData: ({ data }) => {
      const updatedRecord = data?.onDbEvent?.record;

      if (!updatedRecord) return;

      const fieldsUpdater = listenedFields.reduce(
        (acc, listenedField) => ({
          ...acc,
          [listenedField]: () => updatedRecord[listenedField],
        }),
        {},
      );

      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: capitalize(objectNameSingular),
          id: recordId,
        }),
        fields: fieldsUpdater,
      });
    },
  });
};
