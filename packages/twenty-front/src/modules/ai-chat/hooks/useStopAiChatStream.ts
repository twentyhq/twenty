import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useToast } from 'twenty-ui/components/feedback';

import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { endAiChatReplyStatus } from '@/ai-chat/utils/endAiChatReplyStatus';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { StopAgentChatStreamDocument } from '~/generated-metadata/graphql';

export const useStopAiChatStream = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { threadId } = useAiChatInstanceOrThrow();

  const stopAiChatStream = async () => {
    store.set(
      aiChatThreadReplyStatusFamilyState.atomFamily({ threadId }),
      endAiChatReplyStatus('awaiting-first-chunk'),
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
