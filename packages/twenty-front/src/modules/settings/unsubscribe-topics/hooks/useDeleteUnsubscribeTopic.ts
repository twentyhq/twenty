import { useMutation } from '@apollo/client/react';

import { UNSUBSCRIBE_TOPICS } from '@/activities/emails/graphql/metadata-queries/unsubscribeTopics';
import { DELETE_UNSUBSCRIBE_TOPIC } from '@/settings/unsubscribe-topics/graphql/mutations/deleteUnsubscribeTopic';
import {
  type DeleteUnsubscribeTopicMutation,
  type DeleteUnsubscribeTopicMutationVariables,
} from '~/generated-metadata/graphql';

export const useDeleteUnsubscribeTopic = () => {
  const [mutate, { loading, error }] = useMutation<
    DeleteUnsubscribeTopicMutation,
    DeleteUnsubscribeTopicMutationVariables
  >(DELETE_UNSUBSCRIBE_TOPIC, {
    refetchQueries: [{ query: UNSUBSCRIBE_TOPICS }],
  });

  const deleteUnsubscribeTopic = (id: string) => mutate({ variables: { id } });

  return { deleteUnsubscribeTopic, loading, error };
};
