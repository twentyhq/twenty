import { useMutation } from '@apollo/client/react';

import { UNSUBSCRIBE_TOPICS } from '@/activities/emails/graphql/metadata-queries/unsubscribeTopics';
import { UPDATE_UNSUBSCRIBE_TOPIC } from '@/settings/unsubscribe-topics/graphql/mutations/updateUnsubscribeTopic';
import {
  type UpdateUnsubscribeTopicInput,
  type UpdateUnsubscribeTopicMutation,
  type UpdateUnsubscribeTopicMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateUnsubscribeTopic = () => {
  const [mutate, { loading, error }] = useMutation<
    UpdateUnsubscribeTopicMutation,
    UpdateUnsubscribeTopicMutationVariables
  >(UPDATE_UNSUBSCRIBE_TOPIC, {
    refetchQueries: [{ query: UNSUBSCRIBE_TOPICS }],
  });

  const updateUnsubscribeTopic = (input: UpdateUnsubscribeTopicInput) =>
    mutate({ variables: { input } });

  return { updateUnsubscribeTopic, loading, error };
};
