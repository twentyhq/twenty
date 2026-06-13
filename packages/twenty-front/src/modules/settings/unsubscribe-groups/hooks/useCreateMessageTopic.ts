import { useMutation } from '@apollo/client/react';

import { MESSAGE_TOPICS } from '@/activities/emails/graphql/metadata-queries/messageTopics';
import { CREATE_MESSAGE_TOPIC } from '@/settings/unsubscribe-groups/graphql/mutations/createMessageTopic';
import {
  type CreateMessageTopicInput,
  type CreateMessageTopicMutation,
  type CreateMessageTopicMutationVariables,
} from '~/generated-metadata/graphql';

export const useCreateMessageTopic = () => {
  const [mutate, { loading, error }] = useMutation<
    CreateMessageTopicMutation,
    CreateMessageTopicMutationVariables
  >(CREATE_MESSAGE_TOPIC, {
    refetchQueries: [{ query: MESSAGE_TOPICS }],
  });

  const createMessageTopic = (input: CreateMessageTopicInput) =>
    mutate({ variables: { input } });

  return { createMessageTopic, loading, error };
};
