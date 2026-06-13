import { useMutation } from '@apollo/client/react';

import { MESSAGE_TOPICS } from '@/activities/emails/graphql/metadata-queries/messageTopics';
import { DELETE_MESSAGE_TOPIC } from '@/settings/unsubscribe-groups/graphql/mutations/deleteMessageTopic';
import {
  type DeleteMessageTopicMutation,
  type DeleteMessageTopicMutationVariables,
} from '~/generated-metadata/graphql';

export const useDeleteMessageTopic = () => {
  const [mutate, { loading, error }] = useMutation<
    DeleteMessageTopicMutation,
    DeleteMessageTopicMutationVariables
  >(DELETE_MESSAGE_TOPIC, {
    refetchQueries: [{ query: MESSAGE_TOPICS }],
  });

  const deleteMessageTopic = (id: string) => mutate({ variables: { id } });

  return { deleteMessageTopic, loading, error };
};
