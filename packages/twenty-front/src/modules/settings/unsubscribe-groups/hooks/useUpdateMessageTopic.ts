import { useMutation } from '@apollo/client/react';

import { MESSAGE_TOPICS } from '@/activities/emails/graphql/metadata-queries/messageTopics';
import { UPDATE_MESSAGE_TOPIC } from '@/settings/unsubscribe-groups/graphql/mutations/updateMessageTopic';
import {
  type UpdateMessageTopicInput,
  type UpdateMessageTopicMutation,
  type UpdateMessageTopicMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateMessageTopic = () => {
  const [mutate, { loading, error }] = useMutation<
    UpdateMessageTopicMutation,
    UpdateMessageTopicMutationVariables
  >(UPDATE_MESSAGE_TOPIC, {
    refetchQueries: [{ query: MESSAGE_TOPICS }],
  });

  const updateMessageTopic = (input: UpdateMessageTopicInput) =>
    mutate({ variables: { input } });

  return { updateMessageTopic, loading, error };
};
