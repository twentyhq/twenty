import { useMutation } from '@apollo/client/react';

import { MARK_MESSAGE_THREAD_AS_READ } from '@/activities/emails/graphql/mutations/markMessageThreadAsRead';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useToast } from 'twenty-ui/components/feedback';
import {
  type MarkMessageThreadAsReadMutation,
  type MarkMessageThreadAsReadMutationVariables,
} from '~/generated/graphql';

export const useMarkMessageThreadAsRead = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { enqueueToast } = useToast();

  const [mutate] = useMutation<
    MarkMessageThreadAsReadMutation,
    MarkMessageThreadAsReadMutationVariables
  >(MARK_MESSAGE_THREAD_AS_READ, {
    client: apolloCoreClient,
  });

  const markMessageThreadAsRead = async (messageThreadId: string) => {
    try {
      await mutate({ variables: { messageThreadId } });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return;
    }

    apolloCoreClient.cache.modify({
      id: apolloCoreClient.cache.identify({
        __typename: 'TimelineThread',
        id: messageThreadId,
      }),
      fields: { read: () => true },
    });
  };

  return { markMessageThreadAsRead };
};
