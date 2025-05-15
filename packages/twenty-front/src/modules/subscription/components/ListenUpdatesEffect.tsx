import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { useApolloClient } from '@apollo/client';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { DatabaseEventAction } from '~/generated/graphql';

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
    onData: (data) => {
      const updatedRecord = data.onDbEvent.record;

      const fieldsUpdater = listenedFields.reduce((acc, listenedField) => {
        if (!isDefined(updatedRecord[listenedField])) {
          return acc;
        }
        return {
          ...acc,
          [listenedField]: () => updatedRecord[listenedField],
        };
      }, {});

      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: capitalize(objectNameSingular),
          id: recordId,
        }),
        fields: fieldsUpdater,
      });
    },
    skip: listenedFields.length === 0,
  });

  return null;
};
