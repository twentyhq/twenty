import { useApolloClient } from '@apollo/client';
import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { DatabaseEventAction } from '~/generated/graphql';
import { capitalize } from 'twenty-shared/utils';

type ListenRecordUpdatesEffectProps = {
  objectNameSingular: string;
  recordId: string;
  listenedFields: string[];
};

export const ListenRecordUpdatesEffect = ({
  objectNameSingular,
  recordId,
  listenedFields,
}: ListenRecordUpdatesEffectProps) => {
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

  return null;
};
