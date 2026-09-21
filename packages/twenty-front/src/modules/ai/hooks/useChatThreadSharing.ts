import { useMutation, useQuery } from '@apollo/client/react';
import { useToast } from 'twenty-ui/primitives/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  GetChatThreadSharingDocument,
  SetChatThreadShareDocument,
  type ChatThreadShareTargetInput,
} from '~/generated-metadata/graphql';

export const useChatThreadSharing = (threadId: string) => {
  const { data, loading, error, refetch } = useQuery(
    GetChatThreadSharingDocument,
    {
      variables: { threadId },
      fetchPolicy: 'network-only',
    },
  );
  const [setShareMutation, { loading: saving }] = useMutation(
    SetChatThreadShareDocument,
  );
  const { enqueueToast } = useToast();

  const setShare = async (
    target: ChatThreadShareTargetInput,
    enabled: boolean,
  ) => {
    try {
      await setShareMutation({ variables: { threadId, target, enabled } });
      await refetch();
    } catch (mutationError) {
      enqueueToast(getToastOptionsFromError({ error: mutationError }));
    }
  };

  return {
    sharing: data?.chatThreadSharing,
    loading,
    error,
    saving,
    setShare,
    refetch,
  };
};
