import { useMutation } from '@apollo/client/react';

import { UNSUBSCRIBE_TOPICS } from '@/activities/emails/graphql/metadata-queries/unsubscribeTopics';
import { CREATE_UNSUBSCRIBE_TOPIC } from '@/settings/unsubscribe-topics/graphql/mutations/createUnsubscribeTopic';
import {
  type CreateUnsubscribeTopicInput,
  type CreateUnsubscribeTopicMutation,
  type CreateUnsubscribeTopicMutationVariables,
} from '~/generated-metadata/graphql';

export const useCreateUnsubscribeTopic = () => {
  const [mutate, { loading, error }] = useMutation<
    CreateUnsubscribeTopicMutation,
    CreateUnsubscribeTopicMutationVariables
  >(CREATE_UNSUBSCRIBE_TOPIC, {
    refetchQueries: [{ query: UNSUBSCRIBE_TOPICS }],
  });

  const createUnsubscribeTopic = (input: CreateUnsubscribeTopicInput) =>
    mutate({ variables: { input } });

  return { createUnsubscribeTopic, loading, error };
};
