import { useMutation, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  GetChatThreadSharingDocument,
  SetChatThreadShareDocument,
  type ChatThreadShareTargetInput,
} from '~/generated-metadata/graphql';

const SHARING_REFRESH_INTERVAL_MS = 30_000;

export const useChatThreadSharing = (threadId: string, isOpen: boolean) => {
  const { data, loading, error, refetch } = useQuery(
    GetChatThreadSharingDocument,
    {
      variables: { threadId },
      fetchPolicy: 'network-only',
      pollInterval: isOpen ? SHARING_REFRESH_INTERVAL_MS : 0,
      skipPollAttempt: () => document.visibilityState !== 'visible',
      notifyOnNetworkStatusChange: false,
    },
  );
  const [setShareMutation, { loading: saving }] = useMutation(
    SetChatThreadShareDocument,
    {
      update: (cache, { data: mutationData }) => {
        if (!isDefined(mutationData)) {
          return;
        }
        cache.writeQuery({
          query: GetChatThreadSharingDocument,
          variables: { threadId },
          data: { chatThreadSharing: mutationData.setChatThreadShare },
        });
      },
    },
  );
  const { enqueueToast } = useToast();

  const setShare = async (
    target: ChatThreadShareTargetInput,
    enabled: boolean,
  ) => {
    try {
      await setShareMutation({ variables: { threadId, target, enabled } });
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
