import { GET_CHAT_THREAD } from '@/ai/graphql/queries/getChatThread';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

type GetChatThreadResult = {
  chatThread: {
    id: string;
    title: string | null;
  };
};

export const useFetchChatThreadTitle = () => {
  const apolloClient = useApolloClient();

  const fetchChatThreadTitle = useRecoilCallback(
    ({ snapshot, set }) =>
      (threadId: string) => {
        setTimeout(async () => {
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
        }, 3000);
      },
    [apolloClient],
  );

  return { fetchChatThreadTitle };
};
