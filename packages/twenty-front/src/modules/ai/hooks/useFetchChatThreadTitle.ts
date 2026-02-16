import { GET_CHAT_THREAD } from '@/ai/graphql/queries/getChatThread';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

type GetChatThreadResult = {
  chatThread: {
    id: string;
    title: string | null;
  };
};

export const useFetchChatThreadTitle = () => {
  const apolloClient = useApolloClient();

  // Separate callback so each invocation gets a fresh Recoil snapshot
  const executeTitleFetch = useRecoilCallback(
    ({ snapshot, set }) =>
      async (threadId: string) => {
        const activeThread = snapshot
          .getLoadable(currentAIChatThreadState)
          .getValue();

        if (activeThread !== threadId) {
          return;
        }

        const result = await apolloClient
          .query<GetChatThreadResult>({
            query: GET_CHAT_THREAD,
            variables: { id: threadId },
            fetchPolicy: 'network-only',
          })
          .catch(() => null);

        const title = result?.data?.chatThread?.title;

        if (isNonEmptyString(title)) {
          set(currentAIChatThreadTitleState, title);
        }
      },
    [apolloClient],
  );

  const fetchChatThreadTitle = useCallback(
    (threadId: string) => {
      setTimeout(() => {
        executeTitleFetch(threadId);
      }, 3000);
    },
    [executeTitleFetch],
  );

  return { fetchChatThreadTitle };
};
