import { GET_CHAT_THREAD } from '@/ai/graphql/queries/getChatThread';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

type GetChatThreadResult = {
  chatThread: {
    id: string;
    title: string | null;
  };
};

export const useFetchChatThreadTitle = () => {
  const apolloClient = useApolloClient();
  const setCurrentAIChatThreadTitle = useSetRecoilState(
    currentAIChatThreadTitleState,
  );

  const fetchChatThreadTitle = useCallback(
    (threadId: string) => {
      setTimeout(async () => {
        const result = await apolloClient
          .query<GetChatThreadResult>({
            query: GET_CHAT_THREAD,
            variables: { id: threadId },
            fetchPolicy: 'network-only',
          })
          .catch(() => null);

        const title = result?.data?.chatThread?.title;

        if (isNonEmptyString(title)) {
          setCurrentAIChatThreadTitle(title);
        }
      }, 3000);
    },
    [apolloClient, setCurrentAIChatThreadTitle],
  );

  return { fetchChatThreadTitle };
};
