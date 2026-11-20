import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useToast } from 'twenty-ui/components/feedback';

import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { StopAgentChatStreamDocument } from '~/generated-metadata/graphql';

export const useStopAiChatStream = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { threadId } = useAiChatInstanceOrThrow();

  const stopAiChatStream = async () => {
    store.set(
      aiChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId }),
      false,
    );

    try {
      await apolloClient.mutate({
        mutation: StopAgentChatStreamDocument,
        variables: { threadId },
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { stopAiChatStream };
};
