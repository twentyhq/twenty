import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadPreviewsState } from '@/ai/states/agentChatThreadPreviewsState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { GetAgentChatThreadPreviewsDocument } from '~/generated-metadata/graphql';

type AgentChatThreadPreviewsEffectProps = {
  threads: Pick<AgentChatThreadRecord, 'id' | 'lastActivityAt'>[];
};

// Fetches the previews of the listed threads that are missing, or older than
// the thread's last activity
export const AgentChatThreadPreviewsEffect = ({
  threads,
}: AgentChatThreadPreviewsEffectProps) => {
  const client = useApolloClient();
  const store = useStore();

  useEffect(() => {
    const previews = store.get(agentChatThreadPreviewsState.atom);
    const staleThreads = threads.filter(
      ({ id, lastActivityAt }) =>
        !isDefined(previews[id]) ||
        previews[id].lastActivityAt !== (lastActivityAt ?? null),
    );

    if (staleThreads.length === 0) {
      return;
    }

    // Recorded before the request, so a re-render does not ask again
    store.set(agentChatThreadPreviewsState.atom, (currentPreviews) => ({
      ...currentPreviews,
      ...Object.fromEntries(
        staleThreads.map(({ id, lastActivityAt }) => [
          id,
          {
            lastActivityAt: lastActivityAt ?? null,
            preview: currentPreviews[id]?.preview ?? null,
          },
        ]),
      ),
    }));

    void client
      .query({
        query: GetAgentChatThreadPreviewsDocument,
        variables: { threadIds: staleThreads.map(({ id }) => id) },
        fetchPolicy: 'network-only',
      })
      .then((result) => {
        const fetchedPreviews = result.data?.agentChatThreadPreviews ?? [];

        store.set(agentChatThreadPreviewsState.atom, (currentPreviews) => ({
          ...currentPreviews,
          ...Object.fromEntries(
            fetchedPreviews.map((preview) => [
              preview.threadId,
              {
                lastActivityAt:
                  currentPreviews[preview.threadId]?.lastActivityAt ?? null,
                preview,
              },
            ]),
          ),
        }));
      })
      .catch(() => {
        // Forget the request so a later render asks again
        store.set(agentChatThreadPreviewsState.atom, (currentPreviews) =>
          Object.fromEntries(
            Object.entries(currentPreviews).filter(
              ([threadId, entry]) =>
                isDefined(entry.preview) ||
                !staleThreads.some(({ id }) => id === threadId),
            ),
          ),
        );
      });
  }, [client, store, threads]);

  return null;
};
